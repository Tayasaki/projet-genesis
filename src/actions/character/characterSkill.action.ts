"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { z } from "zod";
import { createNameAttribute, deleteNameAttribute } from "../attribute-crud";

const characterSkillSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createCharacterSkill = authorizedAction
  .schema(characterSkillSchema)
  .action(async ({ parsedInput }) =>
    createNameAttribute(prisma.characterSkill, parsedInput),
  );

export const deleteCharacterSkill = authorizedAction
  .schema(characterSkillSchema)
  .action(async ({ parsedInput }) =>
    deleteNameAttribute(prisma.characterSkill, parsedInput.name),
  );
