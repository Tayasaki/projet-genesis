"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { z } from "zod";
import { createNameAttribute, deleteNameAttribute } from "../attribute-crud";

const fortuneSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
});

export const createFortune = authorizedAction
  .schema(fortuneSchema)
  .action(async ({ parsedInput }) =>
    createNameAttribute(prisma.fortune, parsedInput),
  );

export const deleteFortune = authorizedAction
  .schema(fortuneSchema.pick({ name: true }))
  .action(async ({ parsedInput }) =>
    deleteNameAttribute(prisma.fortune, parsedInput.name),
  );
