"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const rangeSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createRange = authenticatedAction(
  rangeSchema,
  async ({ name }) => {
    await prisma.range.create({
      data: {
        name: name,
      },
    });
    revalidatePath("/manage");
  },
);

export const deleteRange = authenticatedAction(
  rangeSchema,
  async ({ name }) => {
    await prisma.range.delete({
      where: {
        name: name,
      },
    });
    revalidatePath("/manage");
  },
);