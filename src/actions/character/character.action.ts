"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { openai } from "@ai-sdk/openai";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  GENERATION_MAX_OUTPUT_TOKENS,
  GENERATION_RATE_LIMIT,
  GENERATION_WINDOW_MS,
  MAX_GENERATION_PROMPT_LENGTH,
} from "./generation-limits";

const characterSchema = z.object({
  name: z.string().min(1).max(50),
  pj: z.boolean().optional(),
  origin: z.string().max(100).optional(),
  role: z.string().max(50).optional(),
  age: z.number().min(1).optional(),
  injury: z.string().max(100).optional(),
  extra: z.string().max(200).optional(),
  temperment: z.string(),
  alignment: z.string(),
  fortune: z.string(),
  strength: z.array(z.string().optional()),
  weakness: z.array(z.string().optional()),
  skillSet: z.array(z.string().optional()),
  weaponSet: z.array(z.string().optional()),
  scenarioId: z.string().optional(),
});

const characterIASchema = z.object({
  name: z.string().min(1).max(50),
  pj: z.boolean(),
  origin: z.string().max(100),
  role: z.string().max(50),
  age: z.number().min(1),
  injury: z.string().max(100),
  extra: z.string().max(200),
});

const systemPrompt = `
  Context: 
  You are a Project-Genesis AI, an IA that create character object in JS/TS.
  You have a lot of imagination in order to create great character for scenarios.

  Goal:
  Generate a character that match the schema given to you.

  Criteria:
  * The object that you generate MUST match the schema given to you.
  * You never use someone reel name on purpose.
  * You never add proporties that is not in the schema.
  * You exclusively create JS/TS object.
  * You never write text or explaination of the generated object.
  * You never generate the same object twice.
  * You always write properties in the same language as the user prompt.
  * If the user ask you something else than generating a character, you reply with an empty object.
  
  Response format:
  You reply with the generated object that match the schema.
  `;

// Same error for missing and foreign ids so the response is not an existence oracle.
async function assertOwnedWeapons(userId: string, ids: string[]) {
  const weaponIds = [...new Set(ids)];
  if (
    weaponIds.length > 0 &&
    (await prisma.weapon.count({
      where: { id: { in: weaponIds }, userId },
    })) !== weaponIds.length
  ) {
    throw new Error("Weapon not found or not owned by user");
  }
}

export const createCharacter = authenticatedAction
  .schema(characterSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    parsedInput.strength = parsedInput.strength.filter((s) => s);
    parsedInput.weakness = parsedInput.weakness.filter((w) => w);
    parsedInput.skillSet = parsedInput.skillSet.filter((s) => s);
    parsedInput.weaponSet = parsedInput.weaponSet.filter((w) => w);
    if (parsedInput.scenarioId) {
      const scenario = await prisma.scenario.findUnique({
        where: { id: parsedInput.scenarioId, userId },
      });
      if (!scenario) {
        throw new Error("Scenario not found or not owned by user");
      }
    }
    await assertOwnedWeapons(userId, parsedInput.weaponSet as string[]);
    await prisma.character.create({
      data: {
        name: parsedInput.name,
        pj: parsedInput.pj ?? false,
        origin: parsedInput.origin ?? null,
        role: parsedInput.role ?? null,
        age: parsedInput.age ?? null,
        injury: parsedInput.injury ?? null,
        extra: parsedInput.extra ?? null,
        scenario: {
          connect: {
            id: parsedInput.scenarioId,
          },
        },
        temperment: {
          connect: {
            name: parsedInput.temperment,
          },
        },
        alignment: {
          connect: {
            name: parsedInput.alignment,
          },
        },
        fortune: {
          connect: {
            name: parsedInput.fortune,
          },
        },
        strength: {
          connect: parsedInput.strength.map((s) => ({ name: s })),
        },
        weakness: {
          connect: parsedInput.weakness.map((w) => ({ name: w })),
        },
        skillSet: {
          connect: parsedInput.skillSet.map((s) => ({ name: s })),
        },
        weapon: {
          connect: parsedInput.weaponSet.map((w) => ({ id: w })),
        },
      },
    });
    revalidatePath(`/${parsedInput.scenarioId}`);
  });

// Counts the attempt before the OpenAI call is made, so failed calls still
// consume quota (no refund abuse). The per-user advisory lock serialises
// concurrent requests of one user, which makes count-then-insert atomic.
async function reserveGenerationSlot(userId: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
    const recent = await tx.generationLog.count({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - GENERATION_WINDOW_MS) },
      },
    });
    if (recent >= GENERATION_RATE_LIMIT) {
      return false;
    }
    await tx.generationLog.create({ data: { userId } });
    return true;
  });
}

export const generateCharacter = authenticatedAction
  .schema(
    z.object({
      message: z
        .string()
        .min(1)
        .max(
          MAX_GENERATION_PROMPT_LENGTH,
          `Message must be at most ${MAX_GENERATION_PROMPT_LENGTH} characters`,
        ),
    }),
  )
  .action(async ({ parsedInput, ctx: { userId } }) => {
    // Same role set as authorizedAction in lib/safe-action.ts.
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const exempt = user?.role === "ADMIN" || user?.role === "SUPERUSER";
    if (!exempt && !(await reserveGenerationSlot(userId))) {
      return { type: "rate-limited" };
    }
    try {
      const { output } = await generateText({
        model: openai("gpt-4o"),
        output: Output.object({ schema: characterIASchema }),
        system: systemPrompt,
        prompt: parsedInput.message,
        maxOutputTokens: GENERATION_MAX_OUTPUT_TOKENS,
      });
      return { type: "success", character: output };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        console.error(
          "[generateCharacter] NoObjectGeneratedError:",
          error.text,
        );
        return { type: "validation-error" };
      }
      throw new Error("Error while generating character");
    }
  });

export const updateCharacter = authenticatedAction
  .schema(
    characterSchema
      .omit({ scenarioId: true })
      .merge(z.object({ id: z.string().min(1) })),
  )
  .action(async ({ parsedInput, ctx: { userId } }) => {
    parsedInput.strength = parsedInput.strength.filter((s) => s);
    parsedInput.weakness = parsedInput.weakness.filter((w) => w);
    parsedInput.skillSet = parsedInput.skillSet.filter((s) => s);
    parsedInput.weaponSet = parsedInput.weaponSet.filter((w) => w);
    await assertOwnedWeapons(userId, parsedInput.weaponSet as string[]);
    await prisma.character.update({
      where: {
        id: parsedInput.id,
        scenario: { some: { userId } },
      },
      data: {
        name: parsedInput.name,
        pj: parsedInput.pj ?? false,
        origin: parsedInput.origin ?? null,
        role: parsedInput.role ?? null,
        age: parsedInput.age ?? null,
        injury: parsedInput.injury ?? null,
        extra: parsedInput.extra ?? null,
        temperment: {
          connect: {
            name: parsedInput.temperment,
          },
        },
        alignment: {
          connect: {
            name: parsedInput.alignment,
          },
        },
        fortune: {
          connect: {
            name: parsedInput.fortune,
          },
        },
        strength: {
          set: parsedInput.strength.map((s) => ({ name: s })),
        },
        weakness: {
          set: parsedInput.weakness.map((w) => ({ name: w })),
        },
        skillSet: {
          set: parsedInput.skillSet.map((s) => ({ name: s })),
        },
        weapon: {
          set: parsedInput.weaponSet.map((w) => ({ id: w })),
        },
      },
    });
    revalidatePath("/characters");
  });

export const deleteCharacter = authenticatedAction
  .schema(z.object({ id: z.string().min(1) }))
  .action(async ({ parsedInput, ctx: { userId } }) => {
    await prisma.character.delete({
      where: {
        id: parsedInput.id,
        scenario: { some: { userId } },
      },
    });
    revalidatePath("/characters");
  });
