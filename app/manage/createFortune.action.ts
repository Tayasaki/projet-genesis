"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createFortune = authenticatedAction(
  z.object({
    name: z.string().min(1).max(50),
    description: z.string().max(200).optional(),
  }),
  async ({ name, description }) => {
    await prisma.fortune.create({
      data: {
        name: name,
        description: description,
      },
    });
    revalidatePath("/manage");
  }
);
