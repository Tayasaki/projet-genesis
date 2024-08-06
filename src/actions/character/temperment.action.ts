"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const tempermentSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
});

export const createTemperment = authorizedAction
  .schema(tempermentSchema)
  .action(async ({ parsedInput }) => {
    await prisma.temperment.create({
      data: {
        name: parsedInput.name,
        description: parsedInput.description,
      },
    });
    revalidatePath("/manage");
  });

export const deleteTemperment = authorizedAction
  .schema(tempermentSchema.pick({ name: true }))
  .action(async ({ parsedInput }) => {
    await prisma.temperment.delete({
      where: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  });
