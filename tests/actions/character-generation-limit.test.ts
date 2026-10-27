import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { prisma as prismaClient } from "@/lib/prisma";
import { TEST_USER_ID, type PrismaMock } from "../helpers/action-mocks";
import { attachGenerationLogFake } from "../helpers/generation-log-fake";

const { generateText } = vi.hoisted(() => ({ generateText: vi.fn() }));

vi.mock("@/lib/prisma", async () => {
  const { createPrismaMock } = await import("../helpers/action-mocks");
  return { prisma: createPrismaMock() };
});
vi.mock("@/lib/safe-action", async () => {
  const { createSafeActionMock } = await import("../helpers/action-mocks");
  return createSafeActionMock();
});
vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn((m: string) => ({ modelId: m })),
}));
vi.mock("ai", async (orig) => ({
  ...(await orig<typeof import("ai")>()),
  generateText: generateText,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const prisma = prismaClient as unknown as PrismaMock;

import { generateCharacter } from "@/src/actions/character/character.action";
import {
  GENERATION_MAX_OUTPUT_TOKENS,
  GENERATION_RATE_LIMIT,
  GENERATION_WINDOW_MS,
  MAX_GENERATION_PROMPT_LENGTH,
} from "@/src/actions/character/generation-limits";

const NOW = new Date("2026-10-27T12:00:00Z");
let fake: ReturnType<typeof attachGenerationLogFake>;

function seed(userId: string, count: number, ageMs: number) {
  for (let i = 0; i < count; i++) {
    fake.rows.push({
      id: `seed-${userId}-${ageMs}-${i}`,
      userId,
      createdAt: new Date(NOW.getTime() - ageMs),
    });
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  fake = attachGenerationLogFake(prisma);
  prisma.user.findUnique.mockResolvedValue({ role: "USER" });
  generateText.mockResolvedValue({ output: { name: "Zed" } });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("generateCharacter rate limit", () => {
  it("logs one row for the caller before calling OpenAI", async () => {
    generateText.mockImplementationOnce(async () => {
      expect(fake.rows).toHaveLength(1);
      return { output: { name: "Zed" } };
    });

    const res = await generateCharacter({ message: "a rogue" });

    expect(res?.data).toEqual({
      type: "success",
      character: { name: "Zed" },
    });
    expect(fake.rows).toHaveLength(1);
    expect(fake.rows[0].userId).toBe(TEST_USER_ID);
    expect(generateText).toHaveBeenCalledTimes(1);
  });

  it("stores no prompt text", async () => {
    await generateCharacter({ message: "secret prompt text" });

    expect(fake.tx.generationLog.create).toHaveBeenCalledWith({
      data: { userId: TEST_USER_ID },
    });
  });

  it("accepts the last allowed attempt in the window", async () => {
    seed(TEST_USER_ID, GENERATION_RATE_LIMIT - 1, 1000);

    const res = await generateCharacter({ message: "a rogue" });

    expect(res?.data?.type).toBe("success");
    expect(fake.rows).toHaveLength(GENERATION_RATE_LIMIT);
  });

  it("rejects over the limit without calling OpenAI or adding a row", async () => {
    seed(TEST_USER_ID, GENERATION_RATE_LIMIT, 1000);

    const res = await generateCharacter({ message: "a rogue" });

    expect(res?.data).toEqual({ type: "rate-limited" });
    expect(generateText).not.toHaveBeenCalled();
    expect(fake.rows).toHaveLength(GENERATION_RATE_LIMIT);
    expect(fake.tx.generationLog.create).not.toHaveBeenCalled();
  });

  it("still counts an attempt whose OpenAI call fails", async () => {
    generateText.mockRejectedValueOnce(new Error("network"));

    const res = await generateCharacter({ message: "a rogue" });

    expect(res?.serverError).toBeDefined();
    expect(fake.rows).toHaveLength(1);
    expect(fake.tx.generationLog.delete).not.toHaveBeenCalled();
    expect(fake.tx.generationLog.deleteMany).not.toHaveBeenCalled();
    expect(prisma.generationLog.delete).not.toHaveBeenCalled();
    expect(prisma.generationLog.deleteMany).not.toHaveBeenCalled();
  });

  it("does not count rows older than the window", async () => {
    seed(TEST_USER_ID, GENERATION_RATE_LIMIT, GENERATION_WINDOW_MS + 1000);

    const res = await generateCharacter({ message: "a rogue" });

    expect(res?.data?.type).toBe("success");
    expect(generateText).toHaveBeenCalledTimes(1);
  });

  it("is per user: another user's rows are ignored", async () => {
    seed("someone-else", GENERATION_RATE_LIMIT * 3, 1000);

    const res = await generateCharacter({ message: "a rogue" });

    expect(res?.data?.type).toBe("success");
    expect(fake.rows.filter((r) => r.userId === TEST_USER_ID)).toHaveLength(1);
  });

  it.each(["ADMIN", "SUPERUSER"])("exempts role %s", async (role) => {
    prisma.user.findUnique.mockResolvedValue({ role });
    seed(TEST_USER_ID, GENERATION_RATE_LIMIT * 2, 1000);

    const res = await generateCharacter({ message: "a rogue" });

    expect(res?.data?.type).toBe("success");
    expect(generateText).toHaveBeenCalledTimes(1);
    expect(fake.rows).toHaveLength(GENERATION_RATE_LIMIT * 2);
  });

  it("takes the per-user lock before counting, inside one transaction", async () => {
    await generateCharacter({ message: "a rogue" });

    expect(fake.events).toEqual([
      "tx-start",
      "lock",
      "count",
      "create",
      "tx-end",
    ]);
  });

  it("counts only rows inside the window", async () => {
    await generateCharacter({ message: "a rogue" });

    expect(fake.tx.generationLog.count).toHaveBeenCalledWith({
      where: {
        userId: TEST_USER_ID,
        createdAt: { gte: new Date(NOW.getTime() - GENERATION_WINDOW_MS) },
      },
    });
  });
});

describe("generateCharacter input and output caps", () => {
  it("accepts a message of exactly the maximum length", async () => {
    const res = await generateCharacter({
      message: "a".repeat(MAX_GENERATION_PROMPT_LENGTH),
    });

    expect(res?.data?.type).toBe("success");
  });

  it("rejects a message over the maximum with a clear error, before any DB or OpenAI work", async () => {
    const res = await generateCharacter({
      message: "a".repeat(MAX_GENERATION_PROMPT_LENGTH + 1),
    });

    expect(res?.validationErrors?.message?._errors?.[0]).toContain(
      String(MAX_GENERATION_PROMPT_LENGTH),
    );
    expect(generateText).not.toHaveBeenCalled();
    expect(fake.rows).toHaveLength(0);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("passes maxOutputTokens and keeps model and system prompt", async () => {
    await generateCharacter({ message: "a rogue" });

    const args = generateText.mock.calls[0][0];
    expect(args.maxOutputTokens).toBe(GENERATION_MAX_OUTPUT_TOKENS);
    expect(args.model).toEqual({ modelId: "gpt-4o" });
    expect(args.system).toContain("Project-Genesis AI");
  });
});
