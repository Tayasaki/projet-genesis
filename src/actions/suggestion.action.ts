"use server";

import { prisma } from "@/lib/prisma";
import {
  ActionError,
  authenticatedAction,
  authorizedAction,
} from "@/lib/safe-action";
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
 * ADMIN and SUPERUSER moderate the queue and are exempt. Count and insert run
 * in one transaction behind a per-user advisory lock, so concurrent requests
 * cannot exceed the limit.
 */
export const createSuggestion = authenticatedAction
  .schema(suggestionSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    const { role } = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { role: true },
    });
    const exempt = role === "ADMIN" || role === "SUPERUSER";
    const data = {
      type: parsedInput.type,
      name: parsedInput.name,
      description: parsedInput.description,
      userId,
    };
    try {
      await prisma.$transaction(async (tx) => {
        if (!exempt) {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
          const recent = await tx.suggestion.count({
            where: {
              userId,
              createdAt: {
                gte: new Date(Date.now() - SUGGESTION_RATE_LIMIT.windowMs),
              },
            },
          });
          if (recent >= SUGGESTION_RATE_LIMIT.max) {
            throw new ActionError("Too many suggestions, try again later");
          }
        }
        await tx.suggestion.create({ data });
      });
    } catch (error) {
      if ((error as { code?: string })?.code === UNIQUE_VIOLATION) {
        throw new ActionError("This suggestion already exists");
      }
      throw error;
    }
    revalidatePath("/suggestions");
  });

export const deleteSuggestion = authorizedAction
  .schema(z.object({ name: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    await prisma.suggestion.delete({
      where: {
        name: parsedInput.name,
      },
    });
    revalidatePath("/suggestions");
  });
