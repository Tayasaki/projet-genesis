"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const fortuneSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
});

export const createFortune = authorizedAction(
  fortuneSchema,
  async ({ name, description }) => {
    await prisma.fortune.create({
      data: {
        name: name,
        description: description,
      },
    });
    revalidatePath("/manage");
  },
);

export const deleteFortune = authorizedAction(
  fortuneSchema.pick({ name: true }),
  async ({ name }) => {
    await prisma.fortune.delete({
      where: {
        name: name,
      },
    });
    revalidatePath("/manage");
  },
);
