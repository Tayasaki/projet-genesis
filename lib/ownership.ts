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

/**
 * A character belongs to `Character.userId`. Rows whose `userId` is NULL
 * (legacy data the migration could not attribute) match no user, so they are
 * unreachable: fail-closed until an operator assigns an owner.
 */
export const charactersOwnedBy = (userId: string) =>
  ({ userId }) satisfies Prisma.CharacterWhereInput;

/**
 * Characters deleted together with their user: the owned ones, plus unowned
 * legacy rows linked only to this user's scenarios (nobody else can claim them).
 */
export const charactersErasedWithUser = (userId: string) =>
  ({
    OR: [
      charactersOwnedBy(userId),
      {
        userId: null,
        scenario: { some: { userId }, none: { userId: { not: userId } } },
      },
    ],
  }) satisfies Prisma.CharacterWhereInput;

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
