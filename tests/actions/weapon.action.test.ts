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

import { createWeapon, deleteWeapon } from "@/src/actions/weapon/weapon.action";

const base = {
  name: "Bow",
  weight: "light",
  range: "long",
  damage: "low",
  skillSet: [],
};

describe("createWeapon", () => {
  it("creates a weapon linked to the caller and its catalog entries", async () => {
    await createWeapon({
      ...base,
      ammo: "arrow",
      skillSet: ["archery", undefined, ""],
    });

    const { data } = prisma.weapon.create.mock.calls[0][0];
    expect(data.user).toEqual({ connect: { id: TEST_USER_ID } });
    expect(data.weight).toEqual({ connect: { name: "light" } });
    expect(data.range).toEqual({ connect: { name: "long" } });
    expect(data.damage).toEqual({ connect: { name: "low" } });
    expect(data.ammo).toEqual({ connect: { name: "arrow" } });
    expect(data.weaponSkill).toEqual({ connect: [{ name: "archery" }] });
    expect(data.melee).toBe(false);
    expect(revalidatePath).toHaveBeenCalledWith("/manage");
  });

  it("ignores ammo for melee weapons", async () => {
    await createWeapon({ ...base, melee: true, ammo: "arrow" });

    const { data } = prisma.weapon.create.mock.calls[0][0];
    expect(data.melee).toBe(true);
    expect(data.ammo.connect).toBeUndefined();
  });

  it("does not connect ammo when none is given", async () => {
    await createWeapon(base);

    expect(
      prisma.weapon.create.mock.calls[0][0].data.ammo.connect,
    ).toBeUndefined();
  });

  it("rejects an invalid name without writing", async () => {
    const res = await createWeapon({ ...base, name: "" });

    expect(res?.validationErrors).toBeDefined();
    expect(prisma.weapon.create).not.toHaveBeenCalled();
  });
});

describe("deleteWeapon", () => {
  it("deletes by id and revalidates /manage", async () => {
    await deleteWeapon({ id: "w1" });

    expect(prisma.weapon.delete).toHaveBeenCalledWith({ where: { id: "w1" } });
    expect(revalidatePath).toHaveBeenCalledWith("/manage");
  });
});
