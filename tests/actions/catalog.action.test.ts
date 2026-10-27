import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma as prismaClient } from "@/lib/prisma";
import type { PrismaMock } from "../helpers/action-mocks";

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

import * as alignment from "@/src/actions/character/alignment.action";
import * as characterSkill from "@/src/actions/character/characterSkill.action";
import * as fortune from "@/src/actions/character/fortune.action";
import * as strength from "@/src/actions/character/strength.action";
import * as temperment from "@/src/actions/character/temperment.action";
import * as weakness from "@/src/actions/character/weakness.action";
import * as ammo from "@/src/actions/weapon/ammo.action";
import * as damage from "@/src/actions/weapon/damage.action";
import * as range from "@/src/actions/weapon/range.action";
import * as weaponSkill from "@/src/actions/weapon/weaponSkill.action";
import * as weight from "@/src/actions/weapon/weight.action";

type Run = (input: unknown) => Promise<{
  data?: unknown;
  validationErrors?: unknown;
}>;

const run = (fn: unknown) => fn as Run;

const catalogs: {
  model: string;
  create: Run;
  remove: Run;
  hasDescription: boolean;
}[] = [
  {
    model: "alignment",
    create: run(alignment.createAlignment),
    remove: run(alignment.deleteAlignment),
    hasDescription: true,
  },
  {
    model: "characterSkill",
    create: run(characterSkill.createCharacterSkill),
    remove: run(characterSkill.deleteCharacterSkill),
    hasDescription: false,
  },
  {
    model: "fortune",
    create: run(fortune.createFortune),
    remove: run(fortune.deleteFortune),
    hasDescription: true,
  },
  {
    model: "strength",
    create: run(strength.createStrength),
    remove: run(strength.deleteStrength),
    hasDescription: false,
  },
  {
    model: "temperment",
    create: run(temperment.createTemperment),
    remove: run(temperment.deleteTemperment),
    hasDescription: true,
  },
  {
    model: "weakness",
    create: run(weakness.createWeakness),
    remove: run(weakness.deleteWeakness),
    hasDescription: false,
  },
  {
    model: "ammo",
    create: run(ammo.createAmmo),
    remove: run(ammo.deleteAmmo),
    hasDescription: false,
  },
  {
    model: "damage",
    create: run(damage.createDamage),
    remove: run(damage.deleteDamage),
    hasDescription: false,
  },
  {
    model: "range",
    create: run(range.createRange),
    remove: run(range.deleteRange),
    hasDescription: false,
  },
  {
    model: "weaponSkill",
    create: run(weaponSkill.createWeaponSkill),
    remove: run(weaponSkill.deleteWeaponSkill),
    hasDescription: false,
  },
  {
    model: "weight",
    create: run(weight.createWeight),
    remove: run(weight.deleteWeight),
    hasDescription: false,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe.each(catalogs)("catalog actions: $model", (c) => {
  it("creates the entry and revalidates /manage", async () => {
    await c.create({ name: "Brave" });

    expect(prisma[c.model].create).toHaveBeenCalledTimes(1);
    const arg = prisma[c.model].create.mock.calls[0][0];
    expect(arg.data.name).toBe("Brave");
    expect(revalidatePath).toHaveBeenCalledWith("/manage");
  });

  it("rejects an empty name without touching the database", async () => {
    const res = await c.create({ name: "" });

    expect(res.validationErrors).toBeDefined();
    expect(prisma[c.model].create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects a name longer than 50 characters", async () => {
    const res = await c.create({ name: "x".repeat(51) });

    expect(res.validationErrors).toBeDefined();
    expect(prisma[c.model].create).not.toHaveBeenCalled();
  });

  it("deletes by name and revalidates /manage", async () => {
    await c.remove({ name: "Brave" });

    expect(prisma[c.model].delete).toHaveBeenCalledWith({
      where: { name: "Brave" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/manage");
  });

  it("does not revalidate when the database call fails", async () => {
    prisma[c.model].delete.mockRejectedValueOnce(new Error("db down"));

    const res = await c.remove({ name: "Brave" });

    expect(res.data).toBeUndefined();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  if (c.hasDescription) {
    it("persists the optional description and rejects one over 200 chars", async () => {
      await c.create({ name: "Brave", description: "desc" });
      expect(prisma[c.model].create.mock.calls[0][0].data.description).toBe(
        "desc",
      );

      const res = await c.create({
        name: "Brave",
        description: "d".repeat(201),
      });
      expect(res.validationErrors).toBeDefined();
      expect(prisma[c.model].create).toHaveBeenCalledTimes(1);
    });
  }
});
