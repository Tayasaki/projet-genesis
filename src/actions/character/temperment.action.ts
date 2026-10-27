"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { z } from "zod";
import { createNameAttribute, deleteNameAttribute } from "../attribute-crud";

const tempermentSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
});

export const createTemperment = authorizedAction
  .schema(tempermentSchema)
  .action(async ({ parsedInput }) =>
    createNameAttribute(prisma.temperment, parsedInput),
  );

export const deleteTemperment = authorizedAction
  .schema(tempermentSchema.pick({ name: true }))
  .action(async ({ parsedInput }) =>
    deleteNameAttribute(prisma.temperment, parsedInput.name),
  );
