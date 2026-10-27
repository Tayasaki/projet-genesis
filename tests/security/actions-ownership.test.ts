import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ATTACKER,
  makePrismaFake,
  OWNER,
} from "./ownership-fake";

const h = vi.hoisted(() => ({
  prisma: undefined as unknown as ReturnType<typeof makePrismaFake>,
  session: { user: { id: "" } } as { user: { id: string } } | null,
}));

vi.mock("@/lib/prisma", () => ({
  get prisma() {
    return h.prisma;
  },
}));
vi.mock("@/lib/auth", () => ({ getAuthSession: async () => h.session }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@ai-sdk/openai", () => ({ openai: vi.fn() }));
vi.mock("ai", () => ({
  generateText: vi.fn(),
  Output: { object: vi.fn() },
  NoObjectGeneratedError: { isInstance: () => false },
}));

import {
  createCharacter,
  deleteCharacter,
  updateCharacter,
} from "@/src/actions/character/character.action";
import { updateScenarioCharacter } from "@/src/actions/scenario.action";
import { deleteWeapon } from "@/src/actions/weapon/weapon.action";

const characterInput = {
  name: "Alice",
  temperment: "t",
  alignment: "a",
  fortune: "f",
  strength: [],
  weakness: [],
  skillSet: [],
  weaponSet: [],
};

function actAs(userId: string) {
  h.session = { user: { id: userId } };
}

beforeEach(() => {
  h.prisma = makePrismaFake();
  actAs(OWNER);
});

describe("updateCharacter", () => {
  it("lets the owner update and scopes the where to the owner", async () => {
    const res = await updateCharacter({ ...characterInput, id: "character-1" });

    expect(res?.serverError).toBeUndefined();
    expect(h.prisma.character.update).toHaveBeenCalledOnce();
    expect(h.prisma.character.update.mock.calls[0][0].where).toEqual({
      id: "character-1",
      scenario: { some: { userId: OWNER } },
    });
  });

  it("rejects another user", async () => {
    actAs(ATTACKER);
    const res = await updateCharacter({ ...characterInput, id: "character-1" });

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.character.update.mock.calls[0][0].where).toMatchObject({
      scenario: { some: { userId: ATTACKER } },
    });
  });
});

describe("deleteCharacter", () => {
  it("lets the owner delete and scopes the where to the owner", async () => {
    const res = await deleteCharacter({ id: "character-1" });

    expect(res?.serverError).toBeUndefined();
    expect(h.prisma.character.delete.mock.calls[0][0].where).toEqual({
      id: "character-1",
      scenario: { some: { userId: OWNER } },
    });
  });

  it("rejects another user", async () => {
    actAs(ATTACKER);
    const res = await deleteCharacter({ id: "character-1" });

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.character.delete.mock.calls[0][0].where).toMatchObject({
      scenario: { some: { userId: ATTACKER } },
    });
  });
});

describe("createCharacter", () => {
  it("lets the owner attach a character to their own scenario", async () => {
    const res = await createCharacter({
      ...characterInput,
      scenarioId: "scenario-1",
    });

    expect(res?.serverError).toBeUndefined();
    expect(h.prisma.scenario.findUnique.mock.calls[0][0].where).toEqual({
      id: "scenario-1",
      userId: OWNER,
    });
    expect(h.prisma.character.create).toHaveBeenCalledOnce();
  });

  it("rejects another user's scenario and never creates the character", async () => {
    actAs(ATTACKER);
    const res = await createCharacter({
      ...characterInput,
      scenarioId: "scenario-1",
    });

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.scenario.findUnique.mock.calls[0][0].where).toEqual({
      id: "scenario-1",
      userId: ATTACKER,
    });
    expect(h.prisma.character.create).not.toHaveBeenCalled();
  });
});

describe("deleteWeapon", () => {
  it("lets the owner delete and scopes the where to the owner", async () => {
    const res = await deleteWeapon({ id: "weapon-1" });

    expect(res?.serverError).toBeUndefined();
    expect(h.prisma.weapon.delete.mock.calls[0][0].where).toEqual({
      id: "weapon-1",
      userId: OWNER,
    });
  });

  it("rejects another user", async () => {
    actAs(ATTACKER);
    const res = await deleteWeapon({ id: "weapon-1" });

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.weapon.delete.mock.calls[0][0].where).toEqual({
      id: "weapon-1",
      userId: ATTACKER,
    });
  });
});

describe("updateScenarioCharacter", () => {
  const input = { scenarioId: "scenario-1", characterId: "character-1" };

  it("lets the owner link their character to their scenario", async () => {
    const res = await updateScenarioCharacter(input);

    expect(res?.serverError).toBeUndefined();
    expect(h.prisma.character.findUnique.mock.calls[0][0].where).toEqual({
      id: "character-1",
      scenario: { some: { userId: OWNER } },
    });
    expect(h.prisma.scenario.update.mock.calls[0][0].where).toEqual({
      id: "scenario-1",
      userId: OWNER,
    });
  });

  it("rejects a character the user does not own, before touching the scenario", async () => {
    actAs(ATTACKER);
    const res = await updateScenarioCharacter(input);

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.character.findUnique.mock.calls[0][0].where).toMatchObject({
      scenario: { some: { userId: ATTACKER } },
    });
    expect(h.prisma.scenario.update).not.toHaveBeenCalled();
  });
});

describe("unauthenticated", () => {
  it("is rejected before any Prisma access", async () => {
    h.session = null;
    const res = await deleteWeapon({ id: "weapon-1" });

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.weapon.delete).not.toHaveBeenCalled();
  });
});
