"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const rangeSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createRange = authorizedAction
  .schema(rangeSchema)
  .action(async ({ parsedInput }) => {
    await prisma.range.create({
      data: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  });

export const deleteRange = authorizedAction
  .schema(rangeSchema)
  .action(async ({ parsedInput }) => {
    await prisma.range.delete({
      where: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  });
