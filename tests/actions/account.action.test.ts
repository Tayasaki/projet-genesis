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

const prisma = prismaClient as unknown as PrismaMock & {
  $transaction: ReturnType<typeof vi.fn>;
};
// The shared Proxy mock models only `prisma.<model>.<method>`; same local
// pattern as tests/actions/suggestion.action.test.ts.
prisma.$transaction = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

import { deleteAccount } from "@/src/actions/account.action";

describe("deleteAccount", () => {
  beforeEach(() => {
    prisma.$transaction.mockReset().mockResolvedValue(undefined);
  });

  it("rejects a sessionId that differs from the caller and deletes nothing", async () => {
    const res = await deleteAccount({ sessionId: "someone-else" });

    expect(res?.serverError).toBeDefined();
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it("rejects an empty sessionId at validation", async () => {
    const res = await deleteAccount({ sessionId: "" });

    expect(res?.validationErrors).toBeDefined();
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it("erases the caller's data in one transaction, children before the user", async () => {
    const order: string[] = [];
    for (const [model, method] of [
      ["character", "deleteMany"],
      ["weapon", "deleteMany"],
      ["scenario", "deleteMany"],
      ["user", "delete"],
    ]) {
      prisma[model][method].mockImplementation(() => {
        order.push(`${model}.${method}`);
        return `${model}.${method}`;
      });
    }
    let transactionOps: unknown;
    prisma.$transaction.mockImplementation(async (ops: unknown) => {
      transactionOps = ops;
    });

    const res = await deleteAccount({ sessionId: TEST_USER_ID });

    expect(res?.serverError).toBeUndefined();
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
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(transactionOps).toEqual([
      "character.deleteMany",
      "weapon.deleteMany",
      "scenario.deleteMany",
      "user.delete",
    ]);
    expect(order).toEqual(transactionOps);
  });

  it("does not delete the rows the user cascade already removes", async () => {
    await deleteAccount({ sessionId: TEST_USER_ID });

    expect(prisma.account.delete).not.toHaveBeenCalled();
    expect(prisma.session.deleteMany).not.toHaveBeenCalled();
  });

  it("reports a failed erasure instead of swallowing it", async () => {
    prisma.$transaction.mockRejectedValueOnce(new Error("rolled back"));

    const res = await deleteAccount({ sessionId: TEST_USER_ID });

    expect(res?.serverError).toBeDefined();
  });

  it("lets a user without an account row erase themselves", async () => {
    // No Account row (e.g. a Session-only user): nothing may look one up.
    const res = await deleteAccount({ sessionId: TEST_USER_ID });

    expect(res?.serverError).toBeUndefined();
    expect(prisma.account.findFirstOrThrow).not.toHaveBeenCalled();
    expect(prisma.account.findFirst).not.toHaveBeenCalled();
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: TEST_USER_ID },
    });
  });
});
