"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const fortuneSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
});

export const createFortune = authorizedAction
  .schema(fortuneSchema)
  .action(async ({ parsedInput }) => {
    await prisma.fortune.create({
      data: {
        name: parsedInput.name,
        description: parsedInput.description,
      },
    });
    revalidatePath("/manage");
  });

export const deleteFortune = authorizedAction
  .schema(fortuneSchema.pick({ name: true }))
  .action(async ({ parsedInput }) => {
    await prisma.fortune.delete({
      where: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  });
