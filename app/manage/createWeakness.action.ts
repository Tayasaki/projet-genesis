"use server";

import { authenticatedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const createWeakness = authenticatedAction(
  z.object({
    name: z.string().min(1).max(50),
  }),
  async ({ name }) => {
    await prisma.weakness.create({
      data: {
        name: name,
      },
    });
    revalidatePath("/manage");
  }
);
