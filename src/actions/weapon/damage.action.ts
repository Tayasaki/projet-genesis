"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const damageSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createDamage = authenticatedAction(
  damageSchema,
  async ({ name }) => {
    await prisma.damage.create({
      data: {
        name: name,
      },
    });
    revalidatePath("/manage");
  },
);

export const deleteDamage = authenticatedAction(
  damageSchema,
  async ({ name }) => {
    await prisma.damage.delete({
      where: {
        name: name,
      },
    });
    revalidatePath("/manage");
  },
);