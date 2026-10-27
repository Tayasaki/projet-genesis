"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { z } from "zod";
import { createNameAttribute, deleteNameAttribute } from "../attribute-crud";

const ammoSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createAmmo = authorizedAction
  .schema(ammoSchema)
  .action(async ({ parsedInput }) =>
    createNameAttribute(prisma.ammo, parsedInput),
  );

export const deleteAmmo = authorizedAction
  .schema(ammoSchema)
  .action(async ({ parsedInput }) =>
    deleteNameAttribute(prisma.ammo, parsedInput.name),
  );
