"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ammoSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createAmmo = authorizedAction
  .schema(ammoSchema)
  .action(async ({ parsedInput }) => {
    await prisma.ammo.create({
      data: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  });

export const deleteAmmo = authorizedAction
  .schema(ammoSchema)
  .action(async ({ parsedInput }) => {
    await prisma.ammo.delete({
      where: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  });
