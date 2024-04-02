"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createScenario = authenticatedAction(
  z.object({
    name: z.string().min(1).max(50),
    universe: z.string().min(1).max(30),
    description: z.string().max(200).optional(),
  }),
  async ({ name, universe, description }, { userId }) => {
    await prisma.scenario.create({
      data: {
        name: name,
        universe: universe,
        description: description,
        userId: userId,
      },
    });
    revalidatePath("/");
  },
);

export const deleteScenario = authenticatedAction(
  z.object({ id: z.string().min(1) }),
  async ({ id }, { userId }) => {
    await prisma.scenario.deleteMany({
      where: {
        id: id,
        userId: userId,
      },
    });
    revalidatePath("/");
  },
);
