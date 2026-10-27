"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { z } from "zod";
import { createNameAttribute, deleteNameAttribute } from "../attribute-crud";

const weightSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createWeight = authorizedAction
  .schema(weightSchema)
  .action(async ({ parsedInput }) =>
    createNameAttribute(prisma.weight, parsedInput),
  );

export const deleteWeight = authorizedAction
  .schema(weightSchema)
  .action(async ({ parsedInput }) =>
    deleteNameAttribute(prisma.weight, parsedInput.name),
  );
