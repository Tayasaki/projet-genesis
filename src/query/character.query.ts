import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const getCharacters = (scenarioId: string) =>
  prisma.character.findMany({
    where: {
      scenario: {
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
      weapon: true,
    },
  });

export const getTemperments = () => prisma.temperment.findMany();
export const getStrengths = () => prisma.strength.findMany();
export const getWeaknesses = () => prisma.weakness.findMany();
export const getCharacterSkills = () => prisma.characterSkill.findMany();
export const getAlignments = () => prisma.alignment.findMany();
export const getFortunes = () => prisma.fortune.findMany();

export type Temperments = Prisma.PromiseReturnType<typeof getTemperments>;
export type Strengths = Prisma.PromiseReturnType<typeof getStrengths>;
export type Weaknesses = Prisma.PromiseReturnType<typeof getWeaknesses>;
export type CharacterSkills = Prisma.PromiseReturnType<
  typeof getCharacterSkills
>;
export type Alignments = Prisma.PromiseReturnType<typeof getAlignments>;
export type Fortunes = Prisma.PromiseReturnType<typeof getFortunes>;
export type CharacterScenario = Prisma.PromiseReturnType<
  typeof getCharacters
>[number];
