"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction, authorizedAction } from "@/lib/safe-action";
import { SuggestionType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SUGGESTION_RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 };
const SUGGESTION_NAME_MAX = 100;
const UNIQUE_VIOLATION = "P2002";

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
  name: z.string().min(1).max(SUGGESTION_NAME_MAX),
  description: z.string().max(200).optional(),
});

/**
 * Throttles per user from the database (serverless: no in-memory state).
 * ADMIN and SUPERUSER moderate the queue and are exempt. The count and the
 * later insert are not atomic, so concurrent requests can overshoot the limit
 * by a few rows; it bounds flooding, it is not an exact quota.
 */
const suggestionRateLimit = authenticatedAction.use(async ({ next, ctx }) => {
  const { role } = await prisma.user.findUniqueOrThrow({
    where: { id: ctx.userId },
    select: { role: true },
  });
  if (role !== "ADMIN" && role !== "SUPERUSER") {
    const recent = await prisma.suggestion.count({
      where: {
        userId: ctx.userId,
        createdAt: {
          gte: new Date(Date.now() - SUGGESTION_RATE_LIMIT.windowMs),
        },
      },
    });
    if (recent >= SUGGESTION_RATE_LIMIT.max) {
      throw new Error("Too many suggestions, try again later");
    }
  }
  return next();
});

export const createSuggestion = suggestionRateLimit
  .schema(suggestionSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      await prisma.suggestion.create({
        data: {
          type: parsedInput.type,
          name: parsedInput.name,
          description: parsedInput.description,
          userId: ctx.userId,
        },
      });
    } catch (error) {
      if ((error as { code?: string })?.code === UNIQUE_VIOLATION) {
        throw new Error("This suggestion already exists");
      }
      throw error;
    }
    revalidatePath("/suggestions");
  });

export const deleteSuggestion = authorizedAction
  .schema(suggestionSchema.pick({ name: true }))
  .action(async ({ parsedInput }) => {
    await prisma.suggestion.delete({
      where: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/suggestions");
  });
