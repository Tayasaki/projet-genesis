import { beforeEach, describe, expect, it, vi } from "vitest";

import { ATTACKER, makePrismaFake, OWNER } from "./ownership-fake";

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
vi.mock("@/components/form/character/CharacterForm", () => ({
  CharacterForm: () => null,
}));
vi.mock("@/src/query/character.query", () => ({}));
vi.mock("@/src/query/weapon.query", () => ({}));
vi.mock("@/lib/env", () => ({ env: {} }));

import { generateMetadata as layoutMetadata } from "@/app/[scenarioId]/characters/layout";
import { generateMetadata as characterMetadata } from "@/app/characters/[characterId]/page";

const GENERIC = "Projet Genesis";

function actAs(userId: string | null) {
  h.session = userId ? { user: { id: userId } } : null;
}

beforeEach(() => {
  h.prisma = makePrismaFake();
  actAs(OWNER);
});

describe("characters layout generateMetadata", () => {
  const props = {
    params: Promise.resolve({ scenarioId: "scenario-1" }),
    modal: null,
  };

  it("returns the scenario name for its owner", async () => {
    const meta = await layoutMetadata(props);
    expect(meta.title).toBe("Projet Genesis - Secret Scenario");
  });

  it.each([
    ["another user", ATTACKER],
    ["an anonymous visitor", null],
  ])("returns a generic title without the name for %s", async (_l, id) => {
    actAs(id);
    const meta = await layoutMetadata(props);
    expect(meta.title).toBe(GENERIC);
    expect(JSON.stringify(meta)).not.toContain("Secret Scenario");
  });

  it("does not throw for an unknown scenario", async () => {
    const meta = await layoutMetadata({
      params: Promise.resolve({ scenarioId: "missing" }),
      modal: null,
    });
    expect(meta.title).toBe(GENERIC);
  });
});

describe("character page generateMetadata", () => {
  const props = { params: Promise.resolve({ characterId: "character-1" }) };

  it("returns the character name for its owner", async () => {
    const meta = await characterMetadata(props);
    expect(meta.title).toBe("Projet Genesis - Alice");
  });

  it.each([
    ["another user", ATTACKER],
    ["an anonymous visitor", null],
  ])("returns a generic title without the name for %s", async (_l, id) => {
    actAs(id);
    const meta = await characterMetadata(props);
    expect(meta.title).toBe(GENERIC);
    expect(JSON.stringify(meta)).not.toContain("Alice");
  });

  it("does not throw for an unknown character", async () => {
    const meta = await characterMetadata({
      params: Promise.resolve({ characterId: "missing" }),
    });
    expect(meta.title).toBe(GENERIC);
  });
});
