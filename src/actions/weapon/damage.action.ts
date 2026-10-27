"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { z } from "zod";
import { createNameAttribute, deleteNameAttribute } from "../attribute-crud";

const damageSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createDamage = authorizedAction
  .schema(damageSchema)
  .action(async ({ parsedInput }) =>
    createNameAttribute(prisma.damage, parsedInput),
  );

export const deleteDamage = authorizedAction
  .schema(damageSchema)
  .action(async ({ parsedInput }) =>
    deleteNameAttribute(prisma.damage, parsedInput.name),
  );
