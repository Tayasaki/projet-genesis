"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { z } from "zod";
import { createNameAttribute, deleteNameAttribute } from "../attribute-crud";

const weaknessSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createWeakness = authorizedAction
  .schema(weaknessSchema)
  .action(async ({ parsedInput }) =>
    createNameAttribute(prisma.weakness, parsedInput),
  );

export const deleteWeakness = authorizedAction
  .schema(weaknessSchema)
  .action(async ({ parsedInput }) =>
    deleteNameAttribute(prisma.weakness, parsedInput.name),
  );
