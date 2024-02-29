"use server";

import { authenticatedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const strengthSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createStrength = authenticatedAction(
  strengthSchema,
  async ({ name }) => {
    await prisma.strength.create({
      data: {
        name: name,
      },
    });
    revalidatePath("/manage");
  },
);

export const deleteStrength = authenticatedAction(
  strengthSchema,
  async ({ name }) => {
    await prisma.strength.delete({
      where: {
        name: name,
      },
    });
    revalidatePath("/manage");
  },
);
