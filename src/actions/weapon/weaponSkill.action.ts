"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { z } from "zod";
import { createNameAttribute, deleteNameAttribute } from "../attribute-crud";

const weaponSkillSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createWeaponSkill = authorizedAction
  .schema(weaponSkillSchema)
  .action(async ({ parsedInput }) =>
    createNameAttribute(prisma.weaponSkill, parsedInput),
  );

export const deleteWeaponSkill = authorizedAction
  .schema(weaponSkillSchema)
  .action(async ({ parsedInput }) =>
    deleteNameAttribute(prisma.weaponSkill, parsedInput.name),
  );
