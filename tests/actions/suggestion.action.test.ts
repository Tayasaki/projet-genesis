import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";
import { prisma as prismaClient } from "@/lib/prisma";
import { TEST_USER_ID, type PrismaMock } from "../helpers/action-mocks";

const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/prisma", async () => {
  const { createPrismaMock } = await import("../helpers/action-mocks");
  return { prisma: createPrismaMock() };
});
vi.mock("@/lib/safe-action", async () => {
  const { createSafeActionMock } = await import("../helpers/action-mocks");
  return createSafeActionMock();
});
vi.mock("@prisma/client", () => ({
  SuggestionType: Object.fromEntries(
    [
      "Alignment",
      "Ammo",
      "CharacterSkill",
      "Damage",
      "Fortune",
      "Range",
      "Strength",
      "Temperment",
      "Weakness",
      "WeaponSkill",
      "Weight",
    ].map((k) => [k, k]),
  ),
}));
vi.mock("next/cache", () => ({ revalidatePath }));

const prisma = prismaClient as unknown as PrismaMock & {
  $executeRaw: ReturnType<typeof vi.fn>;
  $transaction: ReturnType<typeof vi.fn>;
};
prisma.$executeRaw = vi.fn();
prisma.$transaction = vi.fn();

const NOW = new Date("2026-10-27T12:00:00.000Z");
const HOUR_MS = 60 * 60 * 1000;
// Mirrors SUGGESTION_RATE_LIMIT in suggestion.action.ts.
const LIMIT = 5;

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  prisma.suggestion.count.mockReset().mockResolvedValue(0);
  prisma.suggestion.create.mockReset().mockResolvedValue(undefined);
  prisma.suggestion.delete.mockReset().mockResolvedValue(undefined);
  prisma.user.findUniqueOrThrow.mockReset().mockResolvedValue({ role: "USER" });
  prisma.$executeRaw.mockReset().mockResolvedValue(1);
  prisma.$transaction.mockReset().mockImplementation((fn) => fn(prisma));
});

afterEach(() => {
  vi.useRealTimers();
});

import {
  createSuggestion,
  deleteSuggestion,
} from "@/src/actions/suggestion.action";

describe("createSuggestion", () => {
  it("stores the suggestion and revalidates /suggestions", async () => {
    await createSuggestion({
      type: "Ammo",
      name: "Arrow",
      description: "pointy",
    });

    expect(prisma.suggestion.create).toHaveBeenCalledWith({
      data: {
        type: "Ammo",
        name: "Arrow",
        description: "pointy",
        userId: TEST_USER_ID,
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/suggestions");
  });

  it.each([
    "Alignment",
    "Ammo",
    "CharacterSkill",
    "Damage",
    "Fortune",
    "Range",
    "Strength",
    "Temperment",
    "Weakness",
    "WeaponSkill",
    "Weight",
  ] as const)("accepts type %s and stores it", async (type) => {
    await createSuggestion({ type, name: "n" });

    expect(prisma.suggestion.create).toHaveBeenCalledWith({
      data: { type, name: "n", description: undefined, userId: TEST_USER_ID },
    });
  });

  it("rejects an unknown type", async () => {
    const res = await createSuggestion({ type: "Bogus" as never, name: "x" });

    expect(res?.validationErrors).toBeDefined();
    expect(prisma.suggestion.create).not.toHaveBeenCalled();
  });

  it("rejects empty name and over-long description", async () => {
    expect(
      (await createSuggestion({ type: "Ammo", name: "" }))?.validationErrors,
    ).toBeDefined();
    expect(
      (
        await createSuggestion({
          type: "Ammo",
          name: "a",
          description: "d".repeat(201),
        })
      )?.validationErrors,
    ).toBeDefined();
    expect(prisma.suggestion.create).not.toHaveBeenCalled();
  });
});

describe("createSuggestion authorship", () => {
  it("stores the creating user's id from the session context", async () => {
    await createSuggestion({ type: "Ammo", name: "Arrow" });

    expect(prisma.suggestion.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: TEST_USER_ID }),
    });
  });
});

describe("createSuggestion rate limit", () => {
  it("counts only this user's suggestions inside the last hour", async () => {
    await createSuggestion({ type: "Ammo", name: "Arrow" });

    expect(prisma.suggestion.count).toHaveBeenCalledWith({
      where: {
        userId: TEST_USER_ID,
        createdAt: { gte: new Date(NOW.getTime() - HOUR_MS) },
      },
    });
  });

  it("allows a suggestion while under the limit", async () => {
    prisma.suggestion.count.mockResolvedValue(LIMIT - 1);

    const res = await createSuggestion({ type: "Ammo", name: "Arrow" });

    expect(res?.serverError).toBeUndefined();
    expect(prisma.suggestion.create).toHaveBeenCalledTimes(1);
  });

  it.each([LIMIT, LIMIT + 3])(
    "rejects with %i recent suggestions and creates no row",
    async (recent) => {
      prisma.suggestion.count.mockResolvedValue(recent);

      const res = await createSuggestion({ type: "Ammo", name: "Arrow" });

      expect(res?.serverError).toMatch(/too many suggestions/i);
      expect(prisma.suggestion.create).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    },
  );

  it.each(["ADMIN", "SUPERUSER"])(
    "exempts %s even when over the limit",
    async (role) => {
      prisma.user.findUniqueOrThrow.mockResolvedValue({ role });
      prisma.suggestion.count.mockResolvedValue(LIMIT + 10);

      const res = await createSuggestion({ type: "Ammo", name: "Arrow" });

      expect(res?.serverError).toBeUndefined();
      expect(prisma.suggestion.create).toHaveBeenCalledTimes(1);
    },
  );

  it("reads the role from the database for the session user", async () => {
    await createSuggestion({ type: "Ammo", name: "Arrow" });

    expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: TEST_USER_ID } }),
    );
  });

  it("moves the window with the clock so old rows stop counting", async () => {
    vi.setSystemTime(new Date(NOW.getTime() + 2 * HOUR_MS));

    await createSuggestion({ type: "Ammo", name: "Arrow" });

    expect(prisma.suggestion.count).toHaveBeenCalledWith({
      where: {
        userId: TEST_USER_ID,
        createdAt: { gte: new Date(NOW.getTime() + HOUR_MS) },
      },
    });
  });
});

describe("createSuggestion input bounds and duplicates", () => {
  it("accepts a name of exactly 100 characters", async () => {
    const res = await createSuggestion({ type: "Ammo", name: "n".repeat(100) });

    expect(res?.validationErrors).toBeUndefined();
    expect(prisma.suggestion.create).toHaveBeenCalledTimes(1);
  });

  it("rejects a name longer than 100 characters", async () => {
    const res = await createSuggestion({ type: "Ammo", name: "n".repeat(101) });

    expect(res?.validationErrors).toBeDefined();
    expect(prisma.suggestion.create).not.toHaveBeenCalled();
  });

  it("turns a unique-name violation (P2002) into a clean error", async () => {
    prisma.suggestion.create.mockRejectedValue(
      Object.assign(new Error("Unique constraint failed on name"), {
        code: "P2002",
      }),
    );

    const res = await createSuggestion({ type: "Ammo", name: "Arrow" });

    expect(res?.serverError).toBe("This suggestion already exists");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("does not mask other database errors as duplicates", async () => {
    prisma.suggestion.create.mockRejectedValue(
      Object.assign(new Error("connection lost"), { code: "P1001" }),
    );

    const res = await createSuggestion({ type: "Ammo", name: "Arrow" });

    expect(res?.serverError).toBe(DEFAULT_SERVER_ERROR_MESSAGE);
  });
});

describe("createSuggestion transaction", () => {
  it("takes the per-user advisory lock before counting and inserting", async () => {
    await createSuggestion({ type: "Ammo", name: "Arrow" });

    const lock = prisma.$executeRaw.mock.invocationCallOrder[0];
    expect(lock).toBeLessThan(
      prisma.suggestion.count.mock.invocationCallOrder[0],
    );
    expect(lock).toBeLessThan(
      prisma.suggestion.create.mock.invocationCallOrder[0],
    );
    expect(prisma.$executeRaw.mock.calls[0].slice(1)).toEqual([TEST_USER_ID]);
  });

  it("skips lock and count for an admin", async () => {
    prisma.user.findUniqueOrThrow.mockResolvedValue({ role: "ADMIN" });

    await createSuggestion({ type: "Ammo", name: "Arrow" });

    expect(prisma.$executeRaw).not.toHaveBeenCalled();
    expect(prisma.suggestion.count).not.toHaveBeenCalled();
  });
});

describe("deleteSuggestion", () => {
  it("still deletes a legacy name longer than the create-side cap", async () => {
    const name = "n".repeat(150);

    const res = await deleteSuggestion({ name });

    expect(res?.validationErrors).toBeUndefined();
    expect(prisma.suggestion.delete).toHaveBeenCalledWith({ where: { name } });
  });

  it("deletes by name and revalidates", async () => {
    await deleteSuggestion({ name: "Arrow" });

    expect(prisma.suggestion.delete).toHaveBeenCalledWith({
      where: { name: "Arrow" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/suggestions");
  });

  it("rejects an empty name", async () => {
    const res = await deleteSuggestion({ name: "" });

    expect(res?.validationErrors).toBeDefined();
    expect(prisma.suggestion.delete).not.toHaveBeenCalled();
  });
});
