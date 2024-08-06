"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const weaponSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  melee: z.boolean().optional(),
  ammo: z.string().optional(),
  weight: z.string(),
  range: z.string(),
  damage: z.string(),
  skillSet: z.array(z.string().optional()),
});

export const createWeapon = authenticatedAction
  .schema(weaponSchema)
  .action(async ({ parsedInput, ctx: userId }) => {
    parsedInput.skillSet = parsedInput.skillSet.filter((s) => s);
    await prisma.weapon.create({
      data: {
        name: parsedInput.name,
        description: parsedInput.description,
        melee: parsedInput.melee ?? false,
        user: {
          connect: {
            id: userId,
          },
        },
        ammo: {
          connect: parsedInput.melee
            ? undefined
            : parsedInput.ammo
              ? { name: parsedInput.ammo }
              : undefined,
        },
        weight: {
          connect: { name: parsedInput.weight },
        },
        range: {
          connect: { name: parsedInput.range },
        },
        damage: {
          connect: { name: parsedInput.damage },
        },
        weaponSkill: {
          connect: parsedInput.skillSet.map((s) => ({ name: s })),
        },
      },
    });
    revalidatePath("/manage");
  });

export const deleteWeapon = authenticatedAction
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput }) => {
    await prisma.weapon.delete({ where: { id: parsedInput.id } });
    revalidatePath("/manage");
  });
