"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const alignmentSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
});

export const createAlignment = authorizedAction.schema(
  alignmentSchema).action(
  async ({ parsedInput }) => {
    await prisma.alignment.create({
      data: {
        name: parsedInput.name,
        description: parsedInput.description,
      },
    });
    revalidatePath("/manage");
  },
);

export const deleteAlignment = authorizedAction.schema(
  alignmentSchema).action(
  async ({ parsedInput }) => {
    await prisma.alignment.delete({
      where: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  },
);
