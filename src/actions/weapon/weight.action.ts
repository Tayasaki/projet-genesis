"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const weightSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createWeight = authorizedAction(weightSchema, async ({ name }) => {
  await prisma.weight.create({
    data: {
      name: name,
    },
  });
  revalidatePath("/manage");
});

export const deleteWeight = authorizedAction(weightSchema, async ({ name }) => {
  await prisma.weight.delete({
    where: {
      name: name,
    },
  });
  revalidatePath("/manage");
});
