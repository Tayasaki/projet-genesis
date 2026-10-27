"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { z } from "zod";
import { createNameAttribute, deleteNameAttribute } from "../attribute-crud";

const alignmentSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
});

export const createAlignment = authorizedAction
  .schema(alignmentSchema)
  .action(async ({ parsedInput }) =>
    createNameAttribute(prisma.alignment, parsedInput),
  );

export const deleteAlignment = authorizedAction
  .schema(alignmentSchema.pick({ name: true }))
  .action(async ({ parsedInput }) =>
    deleteNameAttribute(prisma.alignment, parsedInput.name),
  );
