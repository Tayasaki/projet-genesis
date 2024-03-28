"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const tempermentSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
});

export const createTemperment = authenticatedAction(
  tempermentSchema,
  async ({ name, description }) => {
    await prisma.temperment.create({
      data: {
        name: name,
        description: description,
      },
    });
    revalidatePath("/manage");
  },
);

export const deleteTemperment = authenticatedAction(
  tempermentSchema.pick({ name: true }),
  async ({ name }) => {
    await prisma.temperment.delete({
      where: {
        name: name,
      },
    });
    revalidatePath("/manage");
  },
);
