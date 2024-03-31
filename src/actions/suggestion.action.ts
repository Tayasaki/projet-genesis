"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { SuggestionType } from "@prisma/client";
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

export const createSuggestion = authenticatedAction(
  suggestionSchema,
  async ({ type, name, description }) => {
    await prisma.suggestion.create({
      data: {
        type,
        name,
        description,
      },
    });
  },
);
