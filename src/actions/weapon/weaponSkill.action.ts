"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const weaponSkillSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createWeaponSkill = authorizedAction(
  weaponSkillSchema,
  async ({ name }) => {
    await prisma.weaponSkill.create({
      data: {
        name: name,
      },
    });
    revalidatePath("/manage");
  },
);

export const deleteWeaponSkill = authorizedAction(
  weaponSkillSchema,
  async ({ name }) => {
    await prisma.weaponSkill.delete({
      where: {
        name: name,
      },
    });
    revalidatePath("/manage");
  },
);
