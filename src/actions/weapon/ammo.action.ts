"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ammoSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createAmmo = authenticatedAction(ammoSchema, async ({ name }) => {
  await prisma.ammo.create({
    data: {
      name: name,
    },
  });
  revalidatePath("/manage");
});

export const deleteAmmo = authenticatedAction(ammoSchema, async ({ name }) => {
  await prisma.ammo.delete({
    where: {
      name: name,
    },
  });
  revalidatePath("/manage");
});
