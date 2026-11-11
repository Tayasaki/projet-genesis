"use server";

import { charactersErasedWithUser } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { z } from "zod";

export const deleteAccount = authenticatedAction
  .schema(
    z.object({
      sessionId: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput, ctx: { userId } }) => {
    if (parsedInput.sessionId !== userId) throw new Error("Invalid session id");
    // authenticatedAction already proved a live session for `userId`; an
    // Account row is not required (a user may hold a Session without one).
    // One transaction: all of the user's data is erased or none of it. The
    // user delete cascades to Account, Session and GenerationLog and nulls
    // Suggestion.userId, so those need no delete of their own (deleting an
    // already-cascaded row throws P2025).
    await prisma.$transaction([
      prisma.character.deleteMany({
        where: charactersErasedWithUser(userId),
      }),
      prisma.weapon.deleteMany({
        where: { userId: userId },
      }),
      prisma.scenario.deleteMany({
        where: { userId: userId },
      }),
      prisma.user.delete({
        where: { id: userId },
      }),
    ]);
  });
