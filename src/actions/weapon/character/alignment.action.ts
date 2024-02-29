"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const alignmentSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
});

export const createAlignment = authenticatedAction(
  alignmentSchema,
  async ({ name, description }) => {
    await prisma.alignment.create({
      data: {
        name: name,
        description: description,
      },
    });
    revalidatePath("/manage");
  },
);

export const deleteAlignment = authenticatedAction(
  alignmentSchema,
  async ({ name }) => {
    await prisma.alignment.delete({
      where: {
        name: name,
      },
    });
    revalidatePath("/manage");
  },
);
