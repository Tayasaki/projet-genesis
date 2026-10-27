import { beforeEach, describe, expect, it, vi } from "vitest";

import { ATTACKER, makePrismaFake, OWNER } from "./ownership-fake";

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
      userId: OWNER,
    });
  });

  it("rejects another user", async () => {
    actAs(ATTACKER);
    const res = await updateCharacter({ ...characterInput, id: "character-1" });

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.character.update.mock.calls[0][0].where).toMatchObject({
      userId: ATTACKER,
    });
  });
});

describe("deleteCharacter", () => {
  it("lets the owner delete and scopes the where to the owner", async () => {
    const res = await deleteCharacter({ id: "character-1" });

    expect(res?.serverError).toBeUndefined();
    expect(h.prisma.character.delete.mock.calls[0][0].where).toEqual({
      id: "character-1",
      userId: OWNER,
    });
  });

  it("rejects another user", async () => {
    actAs(ATTACKER);
    const res = await deleteCharacter({ id: "character-1" });

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.character.delete.mock.calls[0][0].where).toMatchObject({
      userId: ATTACKER,
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

describe("Character.userId ownership", () => {
  const data = () =>
    (
      h.prisma.character.create.mock.calls as unknown as [
        { data: Record<string, unknown> },
      ][]
    )[0][0].data;

  it("createCharacter records the caller as owner", async () => {
    const res = await createCharacter({
      ...characterInput,
      scenarioId: "scenario-1",
    });

    expect(res?.serverError).toBeUndefined();
    expect(data().user).toEqual({ connect: { id: OWNER } });
  });

  it("createCharacter takes the owner from the session, not the input", async () => {
    actAs(ATTACKER);
    await createCharacter({ ...characterInput });

    expect(data().user).toEqual({ connect: { id: ATTACKER } });
  });

  it.each([
    [
      "updateCharacter",
      () => updateCharacter({ ...characterInput, id: "character-unowned" }),
    ],
    ["deleteCharacter", () => deleteCharacter({ id: "character-unowned" })],
  ])(
    "%s fails closed on a character with no owner, even in the caller's own scenario",
    async (_name, call) => {
      const res = await call();

      expect(res?.serverError).toBeDefined();
    },
  );

  it("updateCharacter and deleteCharacter reject a character owned by someone else although it is linked to the caller's scenario", async () => {
    const upd = await updateCharacter({
      ...characterInput,
      id: "character-foreign",
    });
    const del = await deleteCharacter({ id: "character-foreign" });

    expect(upd?.serverError).toBeDefined();
    expect(del?.serverError).toBeDefined();
  });

  it("updateScenarioCharacter refuses to link a character the caller does not own", async () => {
    for (const characterId of ["character-unowned", "character-foreign"]) {
      const res = await updateScenarioCharacter({
        scenarioId: "scenario-1",
        characterId,
      });
      expect(res?.serverError).toBeDefined();
    }
    expect(h.prisma.scenario.update).not.toHaveBeenCalled();
  });
});

describe("character weapon attachment", () => {
  const OWN = "weapon-1";
  const FOREIGN = "weapon-2";
  const createdData = () =>
    (
      h.prisma.character.create.mock.calls as unknown as [
        { data: Record<string, unknown> },
      ][]
    )[0][0].data;
  const updatedData = () =>
    (
      h.prisma.character.update.mock.calls as unknown as [
        { data: Record<string, unknown> },
      ][]
    )[0][0].data;

  it("createCharacter attaches the user's own weapon", async () => {
    const res = await createCharacter({ ...characterInput, weaponSet: [OWN] });

    expect(res?.serverError).toBeUndefined();
    expect(createdData().weapon).toEqual({
      connect: [{ id: OWN }],
    });
  });

  it("createCharacter rejects another user's weapon and never creates", async () => {
    const res = await createCharacter({
      ...characterInput,
      weaponSet: [FOREIGN],
    });

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.character.create).not.toHaveBeenCalled();
  });

  it("createCharacter rejects a mixed own and foreign list as a whole", async () => {
    const res = await createCharacter({
      ...characterInput,
      weaponSet: [OWN, FOREIGN],
    });

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.character.create).not.toHaveBeenCalled();
  });

  it("createCharacter treats a missing id exactly like a foreign id", async () => {
    const foreign = await createCharacter({
      ...characterInput,
      weaponSet: [FOREIGN],
    });
    const missing = await createCharacter({
      ...characterInput,
      weaponSet: ["no-such-weapon"],
    });

    expect(missing?.serverError).toBe(foreign?.serverError);
    expect(missing?.serverError).toBeDefined();
    const calls = h.prisma.weapon.count.mock.calls as unknown as [
      { where: { id: { in: string[] }; userId: string } },
    ][];
    expect(calls).toHaveLength(2);
    expect(calls[0][0].where.userId).toBe(calls[1][0].where.userId);
    expect(calls[0][0].where.id.in).toHaveLength(
      calls[1][0].where.id.in.length,
    );
    expect(h.prisma.character.create).not.toHaveBeenCalled();
  });

  it("createCharacter accepts a repeated own id (distinct count)", async () => {
    const res = await createCharacter({
      ...characterInput,
      weaponSet: [OWN, OWN],
    });

    expect(res?.serverError).toBeUndefined();
    expect(h.prisma.character.create).toHaveBeenCalledOnce();
  });

  it("updateCharacter sets the user's own weapon", async () => {
    const res = await updateCharacter({
      ...characterInput,
      id: "character-1",
      weaponSet: [OWN],
    });

    expect(res?.serverError).toBeUndefined();
    expect(updatedData().weapon).toEqual({
      set: [{ id: OWN }],
    });
  });

  it("updateCharacter rejects another user's weapon and never updates", async () => {
    const res = await updateCharacter({
      ...characterInput,
      id: "character-1",
      weaponSet: [FOREIGN],
    });

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.character.update).not.toHaveBeenCalled();
  });

  it("updateCharacter rejects a mixed list as a whole", async () => {
    const res = await updateCharacter({
      ...characterInput,
      id: "character-1",
      weaponSet: [OWN, FOREIGN],
    });

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.character.update).not.toHaveBeenCalled();
  });

  it("scopes the ownership query to the requesting user", async () => {
    actAs(ATTACKER);
    await createCharacter({ ...characterInput, weaponSet: [FOREIGN] });

    expect(h.prisma.weapon.count).toHaveBeenCalledWith({
      where: { id: { in: [FOREIGN] }, userId: ATTACKER },
    });
  });
});

describe("unauthenticated character writes", () => {
  beforeEach(() => {
    h.session = null;
  });

  it("createCharacter is rejected before any Prisma call", async () => {
    const res = await createCharacter({
      ...characterInput,
      weaponSet: ["weapon-1"],
    });

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.weapon.count).not.toHaveBeenCalled();
    expect(h.prisma.character.create).not.toHaveBeenCalled();
  });

  it("updateCharacter is rejected before any Prisma call", async () => {
    const res = await updateCharacter({
      ...characterInput,
      id: "character-1",
      weaponSet: ["weapon-1"],
    });

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.weapon.count).not.toHaveBeenCalled();
    expect(h.prisma.character.update).not.toHaveBeenCalled();
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
      userId: OWNER,
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
      userId: ATTACKER,
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
