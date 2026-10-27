import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  scenario: { findUnique: vi.fn() },
  character: { findUnique: vi.fn() },
  weapon: { count: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma }));

import {
  assertOwnedCharacter,
  assertOwnedScenario,
  assertOwnedWeapons,
  characterOwnedBy,
  charactersOwnedBy,
  scenarioOwnedBy,
  weaponOwnedBy,
} from "@/lib/ownership";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ownership predicates", () => {
  it("scopes a scenario by id and owner", () => {
    expect(scenarioOwnedBy("s1", "u1")).toEqual({ id: "s1", userId: "u1" });
  });

  it("scopes a weapon by id and owner", () => {
    expect(weaponOwnedBy("w1", "u1")).toEqual({ id: "w1", userId: "u1" });
  });

  it("scopes characters to those reachable through one of the user's scenarios", () => {
    expect(charactersOwnedBy("u1")).toEqual({
      scenario: { some: { userId: "u1" } },
    });
  });

  it("scopes a single character by id and the character predicate", () => {
    expect(characterOwnedBy("c1", "u1")).toEqual({
      id: "c1",
      ...charactersOwnedBy("u1"),
    });
  });
});

describe("assertOwnedScenario", () => {
  it("resolves when the scenario belongs to the user", async () => {
    prisma.scenario.findUnique.mockResolvedValue({ id: "s1" });

    await expect(assertOwnedScenario("u1", "s1")).resolves.toBeUndefined();
    expect(prisma.scenario.findUnique).toHaveBeenCalledWith({
      where: { id: "s1", userId: "u1" },
    });
  });

  it("throws when the scenario is missing or foreign", async () => {
    prisma.scenario.findUnique.mockResolvedValue(null);

    await expect(assertOwnedScenario("u1", "s1")).rejects.toThrow(
      "Scenario not found or not owned by user",
    );
  });
});

describe("assertOwnedCharacter", () => {
  it("resolves when the character belongs to the user", async () => {
    prisma.character.findUnique.mockResolvedValue({ id: "c1" });

    await expect(assertOwnedCharacter("u1", "c1")).resolves.toBeUndefined();
    expect(prisma.character.findUnique).toHaveBeenCalledWith({
      where: characterOwnedBy("c1", "u1"),
    });
  });

  it("throws when the character is missing or foreign", async () => {
    prisma.character.findUnique.mockResolvedValue(null);

    await expect(assertOwnedCharacter("u1", "c1")).rejects.toThrow(
      "Character not found or not owned by user",
    );
  });
});

describe("assertOwnedWeapons", () => {
  it("skips the query for an empty list", async () => {
    await expect(assertOwnedWeapons("u1", [])).resolves.toBeUndefined();
    expect(prisma.weapon.count).not.toHaveBeenCalled();
  });

  it("accepts ids that all belong to the user, counting distinct ids", async () => {
    prisma.weapon.count.mockResolvedValue(1);

    await expect(
      assertOwnedWeapons("u1", ["w1", "w1"]),
    ).resolves.toBeUndefined();
    expect(prisma.weapon.count).toHaveBeenCalledWith({
      where: { id: { in: ["w1"] }, userId: "u1" },
    });
  });

  it("rejects when any id is missing or foreign", async () => {
    prisma.weapon.count.mockResolvedValue(1);

    await expect(assertOwnedWeapons("u1", ["w1", "w2"])).rejects.toThrow(
      "Weapon not found or not owned by user",
    );
  });
});
