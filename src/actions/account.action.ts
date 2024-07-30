"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { z } from "zod";

export const deleteAccount = authenticatedAction(
  z.object({
    sessionId: z.string().min(1),
  }),
  async ({ sessionId }, { userId }) => {
    if (sessionId !== userId) throw new Error("Invalid session id");
    const account = await prisma.account.findFirstOrThrow({
      where: { userId: userId },
    });
    await prisma.character.deleteMany({
      where: {
        scenario: {
          some: { userId: userId },
        },
      },
    });
    await prisma.weapon.deleteMany({
      where: { userId: userId },
    });
    await prisma.scenario.deleteMany({
      where: { userId: userId },
    });
    await prisma.user.delete({
      where: { id: userId },
    });
    await prisma.session.deleteMany({
      where: { userId: userId },
    });
    await prisma.account.delete({
      where: { id: account.id },
    });
  },
);
