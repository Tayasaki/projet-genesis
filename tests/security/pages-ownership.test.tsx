import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ATTACKER,
  characterRow,
  makePrismaFake,
  OWNER,
  unownedCharacterRow,
} from "./ownership-fake";

const h = vi.hoisted(() => ({
  prisma: undefined as unknown as ReturnType<typeof makePrismaFake>,
  session: null as { user: { id: string } } | null,
}));

vi.mock("@/lib/prisma", () => ({
  get prisma() {
    return h.prisma;
  },
}));
vi.mock("@/lib/auth", () => ({ getAuthSession: async () => h.session }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (to: string) => {
    throw new Error(`NEXT_REDIRECT:${to}`);
  },
}));
vi.mock("@/src/query/character.query", () => ({
  getCharacters: async () => [],
}));
vi.mock("../../src/query/character.query", () => ({
  getCharacters: async () => [],
}));
vi.mock("@/components/features/layout/CharacterModal", () => ({
  CharacterModal: () => null,
}));
vi.mock("@/components/features/layout/Character", () => ({
  Character: () => null,
}));
vi.mock("@/components/features/layout/ImportCharacter", () => ({
  ImportCharacter: () => null,
}));
vi.mock("@/components/features/layout/DisplayCharacter", () => ({
  DisplayCharacter: () => null,
}));

import ScenarioManage from "@/app/[scenarioId]/characters/page";
import ModalCharacter from "@/app/[scenarioId]/characters/@modal/(...)characters/[characterId]/page";

function actAs(userId: string) {
  h.session = { user: { id: userId } };
}

beforeEach(() => {
  h.prisma = makePrismaFake();
  actAs(OWNER);
});

describe("ScenarioManage page", () => {
  const props = { params: Promise.resolve({ scenarioId: "scenario-1" }) };

  it("renders for the scenario owner and scopes both lookups to the user", async () => {
    await expect(ScenarioManage(props)).resolves.toBeDefined();

    expect(h.prisma.scenario.findUnique.mock.calls[0][0].where).toEqual({
      id: "scenario-1",
      userId: OWNER,
    });
    expect(h.prisma.character.findMany.mock.calls[0][0].where).toEqual({
      userId: OWNER,
    });
  });

  it("returns notFound for another user's scenario", async () => {
    actAs(ATTACKER);
    await expect(ScenarioManage(props)).rejects.toThrow("NEXT_NOT_FOUND");
    expect(h.prisma.scenario.findUnique.mock.calls[0][0].where).toEqual({
      id: "scenario-1",
      userId: ATTACKER,
    });
  });

  it("redirects anonymous visitors to /login", async () => {
    h.session = null;
    await expect(ScenarioManage(props)).rejects.toThrow("NEXT_REDIRECT:/login");
  });
});

describe("@modal character page", () => {
  const props = {
    params: Promise.resolve({ characterId: characterRow.id }),
  };

  it("renders for the owner and scopes the lookup to the user", async () => {
    await expect(ModalCharacter(props)).resolves.toBeDefined();

    expect(h.prisma.character.findUnique.mock.calls[0][0].where).toEqual({
      id: "character-1",
      userId: OWNER,
    });
  });

  it("returns notFound for a character of another user", async () => {
    actAs(ATTACKER);
    await expect(ModalCharacter(props)).rejects.toThrow("NEXT_NOT_FOUND");
    expect(h.prisma.character.findUnique.mock.calls[0][0].where).toMatchObject({
      userId: ATTACKER,
    });
  });

  it("returns notFound for a character with no owner, even in the viewer's own scenario", async () => {
    await expect(
      ModalCharacter({
        params: Promise.resolve({ characterId: unownedCharacterRow.id }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("redirects anonymous visitors to /login", async () => {
    h.session = null;
    await expect(ModalCharacter(props)).rejects.toThrow("NEXT_REDIRECT:/login");
  });
});
