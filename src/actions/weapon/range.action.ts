"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { z } from "zod";
import { createNameAttribute, deleteNameAttribute } from "../attribute-crud";

const rangeSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createRange = authorizedAction
  .schema(rangeSchema)
  .action(async ({ parsedInput }) =>
    createNameAttribute(prisma.range, parsedInput),
  );

export const deleteRange = authorizedAction
  .schema(rangeSchema)
  .action(async ({ parsedInput }) =>
    deleteNameAttribute(prisma.range, parsedInput.name),
  );
