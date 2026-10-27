import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma as prismaClient } from "@/lib/prisma";
import { TEST_USER_ID, type PrismaMock } from "../helpers/action-mocks";

const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/prisma", async () => {
  const { createPrismaMock } = await import("../helpers/action-mocks");
  return { prisma: createPrismaMock() };
});
vi.mock("@/lib/safe-action", async () => {
  const { createSafeActionMock } = await import("../helpers/action-mocks");
  return createSafeActionMock();
});
vi.mock("next/cache", () => ({ revalidatePath }));

const prisma = prismaClient as unknown as PrismaMock;

beforeEach(() => {
  vi.clearAllMocks();
});

import {
  createScenario,
  deleteScenario,
  updateScenarioCharacter,
} from "@/src/actions/scenario.action";

describe("createScenario", () => {
  it("creates a scenario owned by the caller and revalidates /", async () => {
    await createScenario({ name: "Heist", universe: "Noir", description: "d" });

    expect(prisma.scenario.create).toHaveBeenCalledWith({
      data: {
        name: "Heist",
        universe: "Noir",
        description: "d",
        userId: TEST_USER_ID,
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("accepts a missing description", async () => {
    await createScenario({ name: "Heist", universe: "Noir" });

    expect(
      prisma.scenario.create.mock.calls[0][0].data.description,
    ).toBeUndefined();
  });

  it.each([
    ["empty name", { name: "", universe: "u" }],
    ["name over 50", { name: "n".repeat(51), universe: "u" }],
    ["empty universe", { name: "n", universe: "" }],
    ["universe over 30", { name: "n", universe: "u".repeat(31) }],
    [
      "description over 200",
      { name: "n", universe: "u", description: "d".repeat(201) },
    ],
  ])("rejects %s", async (_label, input) => {
    const res = await createScenario(input);

    expect(res?.validationErrors).toBeDefined();
    expect(prisma.scenario.create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("updateScenarioCharacter", () => {
  it("connects the character scoped to the caller's scenario", async () => {
    await updateScenarioCharacter({ scenarioId: "s1", characterId: "c1" });

    expect(prisma.scenario.update).toHaveBeenCalledWith({
      where: { id: "s1", userId: TEST_USER_ID },
      data: { character: { connect: { id: "c1" } } },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/s1/characters");
  });

  it("rejects empty ids", async () => {
    const res = await updateScenarioCharacter({
      scenarioId: "",
      characterId: "c1",
    });

    expect(res?.validationErrors).toBeDefined();
    expect(prisma.scenario.update).not.toHaveBeenCalled();
  });
});

describe("deleteScenario", () => {
  it("deletes only scenarios matching id and caller", async () => {
    await deleteScenario({ id: "s1" });

    expect(prisma.scenario.deleteMany).toHaveBeenCalledWith({
      where: { id: "s1", userId: TEST_USER_ID },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("rejects an empty id", async () => {
    const res = await deleteScenario({ id: "" });

    expect(res?.validationErrors).toBeDefined();
    expect(prisma.scenario.deleteMany).not.toHaveBeenCalled();
  });
});
