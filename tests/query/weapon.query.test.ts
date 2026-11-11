import { beforeEach, describe, expect, it, vi } from "vitest";

const OWNER = "user-owner";
const ATTACKER = "user-attacker";

const ownedWeapon = { id: "weapon-1", userId: OWNER };
const foreignWeapon = { id: "weapon-2", userId: ATTACKER };
const ammos = [{ id: "ammo-1" }];
const weights = [{ id: "weight-1" }];
const damages = [{ id: "damage-1" }];
const ranges = [{ id: "range-1" }];
const weaponSkills = [{ id: "weapon-skill-1" }];

vi.mock("@/lib/prisma", () => ({
  prisma: {
    weapon: {
      findMany: vi.fn(async (args: { where: { userId: string } }) =>
        [ownedWeapon, foreignWeapon].filter((w) => w.userId === args.where.userId),
      ),
    },
    ammo: { findMany: vi.fn(async () => ammos) },
    weight: { findMany: vi.fn(async () => weights) },
    damage: { findMany: vi.fn(async () => damages) },
    range: { findMany: vi.fn(async () => ranges) },
    weaponSkill: { findMany: vi.fn(async () => weaponSkills) },
  },
}));
vi.mock("@prisma/client", () => ({ Prisma: {} }));

import {
  getAmmos,
  getDamages,
  getRanges,
  getWeaponSkill,
  getWeapons,
  getWeights,
} from "@/src/query/weapon.query";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getWeapons", () => {
  it("returns only the viewer's own weapons", async () => {
    await expect(getWeapons(OWNER)).resolves.toEqual([ownedWeapon]);
  });

  it("returns nothing for a viewer who owns no weapons", async () => {
    await expect(getWeapons("somebody-else")).resolves.toEqual([]);
  });
});

describe("reference-table getters", () => {
  it("getAmmos lists all ammo rows", async () => {
    await expect(getAmmos()).resolves.toEqual(ammos);
  });

  it("getWeights lists all weight rows", async () => {
    await expect(getWeights()).resolves.toEqual(weights);
  });

  it("getDamages lists all damage rows", async () => {
    await expect(getDamages()).resolves.toEqual(damages);
  });

  it("getRanges lists all range rows", async () => {
    await expect(getRanges()).resolves.toEqual(ranges);
  });

  it("getWeaponSkill lists all weapon-skill rows", async () => {
    await expect(getWeaponSkill()).resolves.toEqual(weaponSkills);
  });
});
