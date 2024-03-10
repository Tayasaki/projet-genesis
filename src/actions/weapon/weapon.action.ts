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
  skillSet: z.array(z.string()).optional(),
});

export const createWeapon = authenticatedAction(
  weaponSchema,
  async ({
    name,
    description,
    melee,
    ammo,
    weight,
    range,
    damage,
    skillSet,
  }) => {
    await prisma.weapon.create({
      data: {
        name: name,
        description: description,
        melee: melee ?? false,
        ammo: {
          connect: { name: ammo },
        },
        weight: {
          connect: { name: weight },
        },
        range: {
          connect: { name: range },
        },
        damage: {
          connect: { name: damage },
        },
        weaponSkill: {
          connect: skillSet?.map((s) => ({ name: s })),
        },
      },
    });
    revalidatePath("/***********");
  },
);
