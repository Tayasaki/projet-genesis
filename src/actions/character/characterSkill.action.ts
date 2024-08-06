"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const characterSkillSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createCharacterSkill = authorizedAction
  .schema(characterSkillSchema)
  .action(async ({ parsedInput }) => {
    await prisma.characterSkill.create({
      data: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  });

export const deleteCharacterSkill = authorizedAction
  .schema(characterSkillSchema)
  .action(async ({ parsedInput }) => {
    await prisma.characterSkill.delete({
      where: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  });
