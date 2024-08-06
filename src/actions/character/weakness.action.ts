"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const weaknessSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createWeakness = authorizedAction
  .schema(weaknessSchema)
  .action(async ({ parsedInput }) => {
    await prisma.weakness.create({
      data: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  });

export const deleteWeakness = authorizedAction
  .schema(weaknessSchema)
  .action(async ({ parsedInput }) => {
    await prisma.weakness.delete({
      where: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  });
