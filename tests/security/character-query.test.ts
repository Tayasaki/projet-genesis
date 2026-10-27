import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ATTACKER,
  foreignCharacterRow,
  makePrismaFake,
  OWNER,
  characterRow,
  unownedCharacterRow,
} from "./ownership-fake";

const h = vi.hoisted(() => ({
  prisma: undefined as unknown as ReturnType<typeof makePrismaFake>,
}));
vi.mock("@/lib/prisma", () => ({
  get prisma() {
    return h.prisma;
  },
}));
vi.mock("@prisma/client", () => ({ Prisma: {} }));

import { getCharacters } from "@/src/query/character.query";

beforeEach(() => {
  h.prisma = makePrismaFake();
});

describe("getCharacters", () => {
  it("lists only characters owned by the viewer in the scenario", async () => {
    const rows = await getCharacters("scenario-1", OWNER);

    expect(rows).toEqual([characterRow]);
  });

  it("hides NULL-owner and foreign-owned characters linked to the scenario", async () => {
    const ids = (await getCharacters("scenario-1", OWNER)).map((c) => c.id);

    expect(ids).not.toContain(unownedCharacterRow.id);
    expect(ids).not.toContain(foreignCharacterRow.id);
  });

  it("returns nothing for a viewer who owns none of the linked characters", async () => {
    const rows = await getCharacters("scenario-1", "somebody-else");

    expect(rows.map((c) => c.id)).toEqual([]);
    expect(ATTACKER).not.toBe("somebody-else");
  });
});
