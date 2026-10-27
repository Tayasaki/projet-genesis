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
vi.mock("next/cache", () => ({ revalidatePath }));

const prisma = prismaClient as unknown as PrismaMock;

beforeEach(() => {
  vi.clearAllMocks();
});

import { deleteAccount } from "@/src/actions/account.action";

describe("deleteAccount", () => {
  beforeEach(() => {
    prisma.account.findFirstOrThrow.mockResolvedValue({ id: "acc-1" });
  });

  it("rejects a sessionId that differs from the caller and deletes nothing", async () => {
    const res = await deleteAccount({ sessionId: "someone-else" });

    expect(res?.serverError).toBeDefined();
    expect(prisma.account.findFirstOrThrow).not.toHaveBeenCalled();
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it("rejects an empty sessionId at validation", async () => {
    const res = await deleteAccount({ sessionId: "" });

    expect(res?.validationErrors).toBeDefined();
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it("removes all of the caller's data, scoped by userId, in order", async () => {
    const order: string[] = [];
    for (const [model, method] of [
      ["character", "deleteMany"],
      ["weapon", "deleteMany"],
      ["scenario", "deleteMany"],
      ["user", "delete"],
      ["session", "deleteMany"],
      ["account", "delete"],
    ]) {
      prisma[model][method].mockImplementation(async () => {
        order.push(`${model}.${method}`);
      });
    }

    await deleteAccount({ sessionId: TEST_USER_ID });

    expect(prisma.account.findFirstOrThrow).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
    });
    expect(prisma.character.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { userId: TEST_USER_ID },
          {
            userId: null,
            scenario: {
              some: { userId: TEST_USER_ID },
              none: { userId: { not: TEST_USER_ID } },
            },
          },
        ],
      },
    });
    expect(prisma.weapon.deleteMany).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
    });
    expect(prisma.scenario.deleteMany).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
    });
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: TEST_USER_ID },
    });
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
    });
    expect(prisma.account.delete).toHaveBeenCalledWith({
      where: { id: "acc-1" },
    });
    expect(order).toEqual([
      "character.deleteMany",
      "weapon.deleteMany",
      "scenario.deleteMany",
      "user.delete",
      "session.deleteMany",
      "account.delete",
    ]);
  });

  it("fails without deleting anything when the user has no account", async () => {
    prisma.account.findFirstOrThrow.mockRejectedValueOnce(new Error("none"));

    const res = await deleteAccount({ sessionId: TEST_USER_ID });

    expect(res?.serverError).toBeDefined();
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });
});
