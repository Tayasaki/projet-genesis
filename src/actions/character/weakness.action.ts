"use server";

import { authenticatedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const weaknessSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createWeakness = authenticatedAction(
  weaknessSchema,
  async ({ name }) => {
    await prisma.weakness.create({
      data: {
        name: name,
      },
    });
    revalidatePath("/manage");
  },
);

export const deleteWeakness = authenticatedAction(
  weaknessSchema,
  async ({ name }) => {
    await prisma.weakness.delete({
      where: {
        name: name,
      },
    });
    revalidatePath("/manage");
  },
);
