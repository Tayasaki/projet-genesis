import { vi } from "vitest";

export const OWNER = "user-owner";
export const ATTACKER = "user-attacker";

type Row = Record<string, unknown>;

/**
 * Evaluates a Prisma-style `where` against an in-memory row. Supports scalar
 * equality, nested relation objects and `{ some: ... }` on to-many relations,
 * which is all the ownership predicates use. An unknown key fails closed.
 */
export function matches(row: Row, where: Row): boolean {
  return Object.entries(where).every(([key, expected]) => {
    const actual = row[key];
    if (expected === undefined) return true;
    if (expected !== null && typeof expected === "object") {
      const spec = expected as Row;
      if ("some" in spec) {
        return (
          Array.isArray(actual) &&
          actual.some((child) => matches(child as Row, spec.some as Row))
        );
      }
      return (
        actual !== null &&
        typeof actual === "object" &&
        matches(actual as Row, spec)
      );
    }
    return actual === expected;
  });
}

export const scenarioRow = {
  id: "scenario-1",
  name: "Secret Scenario",
  userId: OWNER,
  user: { id: OWNER },
};

export const characterRow = {
  id: "character-1",
  name: "Alice",
  scenario: [scenarioRow],
};

export const weaponRow = { id: "weapon-1", userId: OWNER };

export function makePrismaFake() {
  const notFound = () => {
    throw new Error("Record to modify not found (P2025)");
  };
  const byWhere = (rows: Row[]) => (args: { where: Row }) =>
    rows.find((r) => matches(r, args.where)) ?? null;
  const mutate = (rows: Row[]) =>
    vi.fn(async (args: { where: Row }) => {
      const hit = byWhere(rows)(args);
      if (!hit) notFound();
      return hit;
    });

  const characters: Row[] = [characterRow];
  const scenarios: Row[] = [scenarioRow];
  const weapons: Row[] = [weaponRow];

  return {
    character: {
      findUnique: vi.fn(async (a: { where: Row }) => byWhere(characters)(a)),
      findMany: vi.fn(async (a: { where: Row }) =>
        characters.filter((r) => matches(r, a.where)),
      ),
      create: vi.fn(async () => ({})),
      update: mutate(characters),
      delete: mutate(characters),
    },
    scenario: {
      findUnique: vi.fn(async (a: { where: Row }) => byWhere(scenarios)(a)),
      update: mutate(scenarios),
    },
    weapon: { delete: mutate(weapons) },
  };
}
