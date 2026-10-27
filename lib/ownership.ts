import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * The single place that decides who owns what. Every Prisma `where` or
 * assertion that scopes a Scenario, Character or Weapon to a user comes from
 * here, so changing the ownership model touches this file only. See
 * documentation/reference/authorization-model.md.
 */

export const scenarioOwnedBy = (id: string, userId: string) => ({
  id,
  userId,
});

export const weaponOwnedBy = (id: string, userId: string) => ({ id, userId });

/** Character has no owner column: it belongs to whoever owns one of its scenarios. */
export const charactersOwnedBy = (userId: string) =>
  ({ scenario: { some: { userId } } }) satisfies Prisma.CharacterWhereInput;

export const characterOwnedBy = (id: string, userId: string) => ({
  id,
  ...charactersOwnedBy(userId),
});

export async function assertOwnedScenario(userId: string, scenarioId: string) {
  const scenario = await prisma.scenario.findUnique({
    where: scenarioOwnedBy(scenarioId, userId),
  });
  if (!scenario) throw new Error("Scenario not found or not owned by user");
}

export async function assertOwnedCharacter(
  userId: string,
  characterId: string,
) {
  const character = await prisma.character.findUnique({
    where: characterOwnedBy(characterId, userId),
  });
  if (!character) throw new Error("Character not found or not owned by user");
}

// Same error for missing and foreign ids so the response is not an existence oracle.
export async function assertOwnedWeapons(userId: string, ids: string[]) {
  const weaponIds = [...new Set(ids)];
  if (
    weaponIds.length > 0 &&
    (await prisma.weapon.count({
      where: { id: { in: weaponIds }, userId },
    })) !== weaponIds.length
  ) {
    throw new Error("Weapon not found or not owned by user");
  }
}
