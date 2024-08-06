"use server";

import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/safe-action";
import { openai } from "@ai-sdk/openai";
import { generateObject, TypeValidationError } from "ai";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
  Generate a character that match the schema given to you

  Criteria:
  * The object that you generate MUST match the schema given to you.
  * You never use someone reel name on purpose.
  * You never add proporties that is not in the schema.
  * You exclusively create JS/TS object
  * You never write text or explaination of the generated object
  * You never generate the same object twice
  * You always write properties in french
  
  Response format:
  You reply with the generated object that match the schema
  `;

export const createCharacter = authenticatedAction
  .schema(characterSchema)
  .action(async ({ parsedInput }) => {
    parsedInput.strength = parsedInput.strength.filter((s) => s);
    parsedInput.weakness = parsedInput.weakness.filter((w) => w);
    parsedInput.skillSet = parsedInput.skillSet.filter((s) => s);
    parsedInput.weaponSet = parsedInput.weaponSet.filter((w) => w);
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

export const generateCharacter = authenticatedAction
  .schema(z.object({}))
  .action(async () => {
    try {
      const { object } = await generateObject({
        model: openai("gpt-4o"),
        schema: characterIASchema, // This schema need to be changed
        system: systemPrompt,
        prompt: "Generate a character object",
      });
      return { type: "success", character: object };
    } catch (error) {
      if (TypeValidationError.isTypeValidationError(error)) {
        return { type: "validation-error", value: error.value };
      }
      console.error("Error", error);
      throw new Error("Error while generating character");
    }
  });

export const updateCharacter = authenticatedAction
  .schema(
    characterSchema
      .omit({ scenarioId: true })
      .merge(z.object({ id: z.string().min(1) })),
  )
  .action(async ({ parsedInput }) => {
    parsedInput.strength = parsedInput.strength.filter((s) => s);
    parsedInput.weakness = parsedInput.weakness.filter((w) => w);
    parsedInput.skillSet = parsedInput.skillSet.filter((s) => s);
    parsedInput.weaponSet = parsedInput.weaponSet.filter((w) => w);
    await prisma.character.update({
      where: {
        id: parsedInput.id,
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
  .action(async ({ parsedInput }) => {
    await prisma.character.delete({
      where: {
        id: parsedInput.id,
      },
    });
    revalidatePath("/characters");
  });
