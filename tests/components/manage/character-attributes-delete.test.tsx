import { vi } from "vitest";

const h = vi.hoisted(() => ({
  deleteTemperment: vi.fn(),
  deleteAlignment: vi.fn(),
  deleteFortune: vi.fn(),
  deleteStrength: vi.fn(),
  deleteWeakness: vi.fn(),
  deleteCharacterSkill: vi.fn(),
}));

vi.mock("@/src/actions/character/temperment.action", () => ({
  deleteTemperment: h.deleteTemperment,
}));
vi.mock("@/src/actions/character/alignment.action", () => ({
  deleteAlignment: h.deleteAlignment,
}));
vi.mock("@/src/actions/character/fortune.action", () => ({
  deleteFortune: h.deleteFortune,
}));
vi.mock("@/src/actions/character/strength.action", () => ({
  deleteStrength: h.deleteStrength,
}));
vi.mock("@/src/actions/character/weakness.action", () => ({
  deleteWeakness: h.deleteWeakness,
}));
vi.mock("@/src/actions/character/characterSkill.action", () => ({
  deleteCharacterSkill: h.deleteCharacterSkill,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { CharacterAttributesTable } from "@/app/(app)/manage/characterAttributesColumns";

import { describeAttributeDelete } from "./attribute-delete-suite";

describeAttributeDelete({
  name: "CharacterAttributesTable delete dispatch",
  Table: CharacterAttributesTable,
  pageKey: "characterAttributes",
  mocks: {
    temperment: h.deleteTemperment,
    alignement: h.deleteAlignment,
    fortune: h.deleteFortune,
    strength: h.deleteStrength,
    weakness: h.deleteWeakness,
    skill: h.deleteCharacterSkill,
  },
  labels: {
    temperment: "Tempérament",
    alignement: "Alignement",
    fortune: "Richesse",
    strength: "Force",
    weakness: "Faiblesse",
    skill: "compétence",
  },
  expectedPageTypeCount: 6,
});
