"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { SuggestionType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const suggestionSchema = z.object({
  type: z.enum([
    SuggestionType.Alignment,
    SuggestionType.Ammo,
    SuggestionType.CharacterSkill,
    SuggestionType.Damage,
    SuggestionType.Fortune,
    SuggestionType.Range,
    SuggestionType.Strength,
    SuggestionType.Temperment,
    SuggestionType.Weakness,
    SuggestionType.WeaponSkill,
    SuggestionType.Weight,
  ]),
  name: z.string().min(1),
  description: z.string().max(200).optional(),
});

export const createSuggestion = authenticatedAction
  .schema(suggestionSchema)
  .action(async ({ parsedInput }) => {
    await prisma.suggestion.create({
      data: {
        type: parsedInput.type,
        name: parsedInput.name,
        description: parsedInput.description,
      },
    });
    revalidatePath("/suggestions");
  });

export const deleteSuggestion = authenticatedAction
  .schema(suggestionSchema.pick({ name: true }))
  .action(async ({ parsedInput }) => {
    await prisma.suggestion.delete({
      where: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/suggestions");
  });
