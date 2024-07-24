"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const strengthSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createStrength = authorizedAction(
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

export const deleteStrength = authorizedAction(
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
