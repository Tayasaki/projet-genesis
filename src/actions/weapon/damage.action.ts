"use server";

import { prisma } from "@/lib/prisma";
import { authorizedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const damageSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createDamage = authorizedAction
  .schema(damageSchema)
  .action(async ({ parsedInput }) => {
    await prisma.damage.create({
      data: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  });

export const deleteDamage = authorizedAction
  .schema(damageSchema)
  .action(async ({ parsedInput }) => {
    await prisma.damage.delete({
      where: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/manage");
  });
