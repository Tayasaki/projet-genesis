"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createCharacterSkill = authenticatedAction(
  z.object({
    name: z.string().min(1).max(50),
  }),
  async ({ name }) => {
    await prisma.characterSkill.create({
      data: {
        name: name,
      },
    });
    revalidatePath("/manage");
  }
);
