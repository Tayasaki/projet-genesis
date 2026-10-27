import { beforeEach, describe, expect, it, vi } from "vitest";

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

const prisma = prismaClient as unknown as PrismaMock;

beforeEach(() => {
  vi.clearAllMocks();
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
      data: { type: "Ammo", name: "Arrow", description: "pointy" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/suggestions");
  });

  it("rejects an unknown type", async () => {
    const res = await createSuggestion({ type: "Bogus", name: "x" });

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

describe("deleteSuggestion", () => {
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
