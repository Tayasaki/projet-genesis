"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { z } from "zod";
import { createNameAttribute, deleteNameAttribute } from "../attribute-crud";

const strengthSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createStrength = authorizedAction
  .schema(strengthSchema)
  .action(async ({ parsedInput }) =>
    createNameAttribute(prisma.strength, parsedInput),
  );

export const deleteStrength = authorizedAction
  .schema(strengthSchema)
  .action(async ({ parsedInput }) =>
    deleteNameAttribute(prisma.strength, parsedInput.name),
  );
