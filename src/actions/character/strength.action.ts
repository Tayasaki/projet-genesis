"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const strengthSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createStrength = authorizedAction
  .schema(strengthSchema)
  .action(async ({ parsedInput }) => {
    await prisma.strength.create({
      data: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  });

export const deleteStrength = authorizedAction
  .schema(strengthSchema)
  .action(async ({ parsedInput }) => {
    await prisma.strength.delete({
      where: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  });
