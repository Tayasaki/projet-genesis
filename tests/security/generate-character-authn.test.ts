import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  session: null as { user: { id: string } } | null,
  generateText: vi.fn(),
  prisma: {
    user: { findUnique: vi.fn() },
    generationLog: { count: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
    $transaction: vi.fn(),
    $executeRaw: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: h.prisma }));
vi.mock("@/lib/auth", () => ({ getAuthSession: async () => h.session }));
vi.mock("@ai-sdk/openai", () => ({ openai: vi.fn(() => ({})) }));
vi.mock("ai", async (orig) => ({
  ...(await orig<typeof import("ai")>()),
  generateText: h.generateText,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { generateCharacter } from "@/src/actions/character/character.action";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("generateCharacter authentication", () => {
  it("rejects an unauthenticated caller before OpenAI, the role lookup or any GenerationLog access", async () => {
    h.session = null;

    const res = await generateCharacter({ message: "a rogue" });

    expect(res?.serverError).toBeDefined();
    expect(h.generateText).not.toHaveBeenCalled();
    expect(h.prisma.user.findUnique).not.toHaveBeenCalled();
    expect(h.prisma.$transaction).not.toHaveBeenCalled();
    expect(h.prisma.$executeRaw).not.toHaveBeenCalled();
    expect(h.prisma.generationLog.count).not.toHaveBeenCalled();
    expect(h.prisma.generationLog.create).not.toHaveBeenCalled();
    expect(h.prisma.generationLog.deleteMany).not.toHaveBeenCalled();
  });
});
