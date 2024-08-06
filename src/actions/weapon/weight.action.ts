"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const weightSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createWeight = authorizedAction
  .schema(weightSchema)
  .action(async ({ parsedInput }) => {
    await prisma.weight.create({
      data: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  });

export const deleteWeight = authorizedAction
  .schema(weightSchema)
  .action(async ({ parsedInput }) => {
    await prisma.weight.delete({
      where: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  });
