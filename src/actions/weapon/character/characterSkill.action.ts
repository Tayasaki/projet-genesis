"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const characterSkillSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createCharacterSkill = authenticatedAction(
  characterSkillSchema,
  async ({ name }) => {
    await prisma.characterSkill.create({
      data: {
        name: name,
      },
    });
    revalidatePath("/manage");
  },
);

export const deleteCharacterSkill = authenticatedAction(
  characterSkillSchema,
  async ({ name }) => {
    await prisma.characterSkill.delete({
      where: {
        name: name,
      },
    });
    revalidatePath("/manage");
  },
);
