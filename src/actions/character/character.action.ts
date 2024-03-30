"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const characterSchema = z.object({
  name: z.string().min(1).max(50),
  pj: z.boolean().optional(),
  origin: z.string().max(100).optional(),
  role: z.string().max(50).optional(),
  age: z.number().min(1).optional(),
  injury: z.string().max(100).optional(),
  extra: z.string().max(200).optional(),
  temperment: z.string(),
  alignment: z.string(),
  fortune: z.string(),
  strength: z.array(z.string().optional()),
  weakness: z.array(z.string().optional()),
  skillSet: z.array(z.string().optional()),
  weaponSet: z.array(z.string().optional()),
  scenarioId: z.string().optional(),
});

export const createCharacter = authenticatedAction(
  characterSchema,
  async ({
    name,
    pj,
    origin,
    role,
    age,
    injury,
    extra,
    temperment,
    alignment,
    fortune,
    strength,
    weakness,
    skillSet,
    weaponSet,
    scenarioId,
  }) => {
    strength = strength.filter((s) => s);
    weakness = weakness.filter((w) => w);
    skillSet = skillSet.filter((s) => s);
    weaponSet = weaponSet.filter((w) => w);
    await prisma.character.create({
      data: {
        name: name,
        pj: pj ?? false,
        origin: origin ?? null,
        role: role ?? null,
        age: age ?? null,
        injury: injury ?? null,
        extra: extra ?? null,
        scenario: {
          connect: {
            id: scenarioId,
          },
        },
        temperment: {
          connect: {
            name: temperment,
          },
        },
        alignment: {
          connect: {
            name: alignment,
          },
        },
        fortune: {
          connect: {
            name: fortune,
          },
        },
        strength: {
          connect: strength.map((s) => ({ name: s })),
        },
        weakness: {
          connect: weakness.map((w) => ({ name: w })),
        },
        skillSet: {
          connect: skillSet.map((s) => ({ name: s })),
        },
        weapon: {
          connect: weaponSet.map((w) => ({ id: w })),
        },
      },
    });
    revalidatePath(`/${scenarioId}`);
  },
);

export const updateCharacter = authenticatedAction(
  characterSchema
    .omit({ scenarioId: true })
    .merge(z.object({ id: z.string().min(1) })),
  async ({
    id,
    name,
    pj,
    origin,
    role,
    age,
    injury,
    extra,
    temperment,
    alignment,
    fortune,
    strength,
    weakness,
    skillSet,
    weaponSet,
  }) => {
    strength = strength.filter((s) => s);
    weakness = weakness.filter((w) => w);
    skillSet = skillSet.filter((s) => s);
    weaponSet = weaponSet.filter((w) => w);
    await prisma.character.update({
      where: {
        id: id,
      },
      data: {
        name: name,
        pj: pj ?? false,
        origin: origin ?? null,
        role: role ?? null,
        age: age ?? null,
        injury: injury ?? null,
        extra: extra ?? null,
        temperment: {
          connect: {
            name: temperment,
          },
        },
        alignment: {
          connect: {
            name: alignment,
          },
        },
        fortune: {
          connect: {
            name: fortune,
          },
        },
        strength: {
          set: strength.map((s) => ({ name: s })),
        },
        weakness: {
          set: weakness.map((w) => ({ name: w })),
        },
        skillSet: {
          set: skillSet.map((s) => ({ name: s })),
        },
        weapon: {
          set: weaponSet.map((w) => ({ id: w })),
        },
      },
    });
    revalidatePath("/characters");
  },
);

export const deleteCharacter = authenticatedAction(
  z.object({ id: z.string().min(1) }),
  async ({ id }) => {
    await prisma.character.delete({
      where: {
        id: id,
      },
    });
    revalidatePath("/characters");
  },
);
