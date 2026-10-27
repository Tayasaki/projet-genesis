"use server";

import {
  assertOwnedCharacter,
  scenarioOwnedBy,
} from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createScenario = authenticatedAction
  .schema(
    z.object({
      name: z.string().min(1).max(50),
      universe: z.string().min(1).max(30),
      description: z.string().max(200).optional(),
    }),
  )
  .action(async ({ parsedInput, ctx: { userId } }) => {
    await prisma.scenario.create({
      data: {
        name: parsedInput.name,
        universe: parsedInput.universe,
        description: parsedInput.description,
        userId: userId,
      },
    });
    revalidatePath("/");
  });

export const updateScenarioCharacter = authenticatedAction
  .schema(
    z.object({
      scenarioId: z.string().min(1),
      characterId: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput, ctx: { userId } }) => {
    await assertOwnedCharacter(userId, parsedInput.characterId);
    await prisma.scenario.update({
      where: scenarioOwnedBy(parsedInput.scenarioId, userId),
      data: {
        character: {
          connect: { id: parsedInput.characterId },
        },
      },
    });
    revalidatePath(`/${parsedInput.scenarioId}/characters`);
  });

export const deleteScenario = authenticatedAction
  .schema(z.object({ id: z.string().min(1) }))
  .action(async ({ parsedInput, ctx: { userId } }) => {
    await prisma.scenario.deleteMany({
      where: scenarioOwnedBy(parsedInput.id, userId),
    });
    revalidatePath("/");
  });
