import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const getCharacters = (scenarioId: string) =>
  prisma.character.findMany({
    where: {
      scneario: {
        some: {
          id: scenarioId,
        },
      },
    },
    include: {
      temperment: true,
      alignment: true,
      strength: true,
      weakness: true,
      fortune: true,
      skillSet: true,
    },
  });
export type CharacterScenario = Prisma.PromiseReturnType<
  typeof getCharacters
>[number];
