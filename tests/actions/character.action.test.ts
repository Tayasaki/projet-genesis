import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma as prismaClient } from "@/lib/prisma";
import { TEST_USER_ID, type PrismaMock } from "../helpers/action-mocks";

const { revalidatePath, generateText } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  generateText: vi.fn(),
}));

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
vi.mock("next/cache", () => ({ revalidatePath }));

const prisma = prismaClient as unknown as PrismaMock;

beforeEach(() => {
  vi.clearAllMocks();
});

import { NoObjectGeneratedError } from "ai";

import {
  createCharacter,
  deleteCharacter,
  generateCharacter,
  updateCharacter,
} from "@/src/actions/character/character.action";

const input = {
  name: "Ayla",
  temperment: "calm",
  alignment: "good",
  fortune: "rich",
  strength: ["strong", undefined, ""],
  weakness: ["slow"],
  skillSet: [undefined, "stealth"],
  weaponSet: ["w1", ""],
};

describe("createCharacter", () => {
  it("connects catalog entries, drops empty list items and defaults optionals", async () => {
    await createCharacter({ ...input, scenarioId: "s1" });

    const { data } = prisma.character.create.mock.calls[0][0];
    expect(data).toMatchObject({
      name: "Ayla",
      pj: false,
      origin: null,
      role: null,
      age: null,
      injury: null,
      extra: null,
      scenario: { connect: expect.objectContaining({ id: "s1" }) },
      temperment: { connect: { name: "calm" } },
      alignment: { connect: { name: "good" } },
      fortune: { connect: { name: "rich" } },
      strength: { connect: [{ name: "strong" }] },
      weakness: { connect: [{ name: "slow" }] },
      skillSet: { connect: [{ name: "stealth" }] },
      weapon: { connect: [{ id: "w1" }] },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/s1");
  });

  it("keeps provided optional fields", async () => {
    await createCharacter({
      ...input,
      pj: true,
      origin: "North",
      role: "Scout",
      age: 30,
      injury: "leg",
      extra: "x",
    });

    expect(prisma.character.create.mock.calls[0][0].data).toMatchObject({
      pj: true,
      origin: "North",
      role: "Scout",
      age: 30,
      injury: "leg",
      extra: "x",
    });
  });

  it.each([
    ["empty name", { name: "" }],
    ["age below 1", { age: 0 }],
    ["origin over 100", { origin: "o".repeat(101) }],
  ])("rejects %s", async (_l, patch) => {
    const res = await createCharacter({ ...input, ...patch });

    expect(res?.validationErrors).toBeDefined();
    expect(prisma.character.create).not.toHaveBeenCalled();
  });
});

describe("updateCharacter", () => {
  it("replaces relations with set and targets the character id", async () => {
    await updateCharacter({ ...input, id: "c1", pj: true });

    const call = prisma.character.update.mock.calls[0][0];
    expect(call.where).toEqual(expect.objectContaining({ id: "c1" }));
    expect(call.data.pj).toBe(true);
    expect(call.data.strength).toEqual({ set: [{ name: "strong" }] });
    expect(call.data.skillSet).toEqual({ set: [{ name: "stealth" }] });
    expect(call.data.weapon).toEqual({ set: [{ id: "w1" }] });
    expect(call.data.scenario).toBeUndefined();
    expect(revalidatePath).toHaveBeenCalledWith("/characters");
  });

  it("requires an id", async () => {
    const res = await updateCharacter({ ...input, id: "" });

    expect(res?.validationErrors).toBeDefined();
    expect(prisma.character.update).not.toHaveBeenCalled();
  });
});

describe("deleteCharacter", () => {
  it("deletes by id and revalidates", async () => {
    await deleteCharacter({ id: "c1" });

    expect(prisma.character.delete).toHaveBeenCalledWith({
      where: expect.objectContaining({ id: "c1" }),
    });
    expect(revalidatePath).toHaveBeenCalledWith("/characters");
  });
});

describe("generateCharacter", () => {
  it("returns the generated character on success", async () => {
    const character = { name: "Zed" };
    generateText.mockResolvedValueOnce({ output: character });

    const res = await generateCharacter({ message: "a rogue" });

    expect(res?.data).toEqual({ type: "success", character });
    const args = generateText.mock.calls[0][0];
    expect(args.prompt).toBe("a rogue");
    expect(args.model).toEqual({ modelId: "gpt-4o" });
    expect(args.system).toContain("Project-Genesis AI");
    expect(args.system).toContain("MUST match the schema");
  });

  it("maps NoObjectGeneratedError to a validation-error result", async () => {
    const err = new NoObjectGeneratedError({
      message: "bad",
      text: "{}",
      response: {} as never,
      usage: {} as never,
      finishReason: "stop",
    });
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    generateText.mockRejectedValueOnce(err);

    const res = await generateCharacter({ message: "a rogue" });

    expect(res?.data).toEqual({ type: "validation-error" });
    spy.mockRestore();
  });

  it("surfaces other failures as a server error", async () => {
    generateText.mockRejectedValueOnce(new Error("network"));

    const res = await generateCharacter({ message: "a rogue" });

    expect(res?.serverError).toBeDefined();
    expect(res?.data).toBeUndefined();
  });

  it("rejects an empty message", async () => {
    const res = await generateCharacter({ message: "" });

    expect(res?.validationErrors).toBeDefined();
    expect(generateText).not.toHaveBeenCalled();
  });
});
