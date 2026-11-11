import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  session: null as { user: { id: string } } | null,
  prisma: {
    character: { deleteMany: vi.fn() },
    weapon: { deleteMany: vi.fn() },
    scenario: { deleteMany: vi.fn() },
    user: { delete: vi.fn() },
    account: { findFirstOrThrow: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: h.prisma }));
vi.mock("@/lib/auth", () => ({ getAuthSession: async () => h.session }));

import { deleteAccount } from "@/src/actions/account.action";

function expectNothingErased() {
  expect(h.prisma.$transaction).not.toHaveBeenCalled();
  expect(h.prisma.user.delete).not.toHaveBeenCalled();
  expect(h.prisma.character.deleteMany).not.toHaveBeenCalled();
  expect(h.prisma.weapon.deleteMany).not.toHaveBeenCalled();
  expect(h.prisma.scenario.deleteMany).not.toHaveBeenCalled();
}

beforeEach(() => {
  vi.clearAllMocks();
  h.session = null;
});

describe("deleteAccount authentication", () => {
  it("rejects an unauthenticated caller and erases nothing", async () => {
    const res = await deleteAccount({ sessionId: "victim" });

    expect(res?.serverError).toBeDefined();
    expectNothingErased();
  });

  it("rejects a session without a user id and erases nothing", async () => {
    h.session = { user: { id: "" } };

    const res = await deleteAccount({ sessionId: "victim" });

    expect(res?.serverError).toBeDefined();
    expectNothingErased();
  });

  it("rejects a logged-in caller naming another user and erases nothing", async () => {
    h.session = { user: { id: "attacker" } };

    const res = await deleteAccount({ sessionId: "victim" });

    expect(res?.serverError).toBeDefined();
    expectNothingErased();
  });

  it("erases a logged-in caller's own data without any Account row lookup", async () => {
    h.session = { user: { id: "me" } };

    const res = await deleteAccount({ sessionId: "me" });

    expect(res?.serverError).toBeUndefined();
    expect(h.prisma.account.findFirstOrThrow).not.toHaveBeenCalled();
    expect(h.prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(h.prisma.user.delete).toHaveBeenCalledWith({ where: { id: "me" } });
  });
});
