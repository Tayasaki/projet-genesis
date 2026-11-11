import { beforeEach, describe, expect, it, vi } from "vitest";

const temperments = [{ id: "temperment-1" }];
const strengths = [{ id: "strength-1" }];
const weaknesses = [{ id: "weakness-1" }];
const characterSkills = [{ id: "character-skill-1" }];
const alignments = [{ id: "alignment-1" }];
const fortunes = [{ id: "fortune-1" }];

vi.mock("@/lib/ownership", () => ({ charactersOwnedBy: vi.fn(() => ({})) }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    temperment: { findMany: vi.fn(async () => temperments) },
    strength: { findMany: vi.fn(async () => strengths) },
    weakness: { findMany: vi.fn(async () => weaknesses) },
    characterSkill: { findMany: vi.fn(async () => characterSkills) },
    alignment: { findMany: vi.fn(async () => alignments) },
    fortune: { findMany: vi.fn(async () => fortunes) },
  },
}));
vi.mock("@prisma/client", () => ({ Prisma: {} }));

import {
  getAlignments,
  getCharacterSkills,
  getFortunes,
  getStrengths,
  getTemperments,
  getWeaknesses,
} from "@/src/query/character.query";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("character reference-table getters", () => {
  it("getTemperments lists all temperment rows", async () => {
    await expect(getTemperments()).resolves.toEqual(temperments);
  });

  it("getStrengths lists all strength rows", async () => {
    await expect(getStrengths()).resolves.toEqual(strengths);
  });

  it("getWeaknesses lists all weakness rows", async () => {
    await expect(getWeaknesses()).resolves.toEqual(weaknesses);
  });

  it("getCharacterSkills lists all character-skill rows", async () => {
    await expect(getCharacterSkills()).resolves.toEqual(characterSkills);
  });

  it("getAlignments lists all alignment rows", async () => {
    await expect(getAlignments()).resolves.toEqual(alignments);
  });

  it("getFortunes lists all fortune rows", async () => {
    await expect(getFortunes()).resolves.toEqual(fortunes);
  });
});
