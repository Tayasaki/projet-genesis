import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AlignementForm } from "@/components/form/character/AlignementForm";
import { CharacterSkillForm } from "@/components/form/character/CharacterSkillForm";
import { FortuneForm } from "@/components/form/character/FortuneForm";
import { StrengthForm } from "@/components/form/character/StrengthForm";
import { TempermentForm } from "@/components/form/character/TempermentForm";
import { WeaknessForm } from "@/components/form/character/WeaknessForm";
import { AmmoForm } from "@/components/form/weapon/AmmoForm";
import { DamageForm } from "@/components/form/weapon/DamageForm";
import { RangeForm } from "@/components/form/weapon/RangeForm";
import { WeaponSkillForm } from "@/components/form/weapon/WeaponSkillForm";
import { WeightForm } from "@/components/form/weapon/WeightForm";
import { ScenarioForm } from "@/components/form/ScenarioForm";

const h = vi.hoisted(() => ({
  create: vi.fn(),
  del: vi.fn(),
  createSuggestion: vi.fn(),
  createScenario: vi.fn(),
}));

vi.mock("@/src/actions/character/alignment.action", () => ({
  createAlignment: h.create,
  deleteAlignment: h.del,
}));
vi.mock("@/src/actions/character/characterSkill.action", () => ({
  createCharacterSkill: h.create,
  deleteCharacterSkill: h.del,
}));
vi.mock("@/src/actions/character/fortune.action", () => ({
  createFortune: h.create,
  deleteFortune: h.del,
}));
vi.mock("@/src/actions/character/strength.action", () => ({
  createStrength: h.create,
  deleteStrength: h.del,
}));
vi.mock("@/src/actions/character/temperment.action", () => ({
  createTemperment: h.create,
  deleteTemperment: h.del,
}));
vi.mock("@/src/actions/character/weakness.action", () => ({
  createWeakness: h.create,
  deleteWeakness: h.del,
}));
vi.mock("@/src/actions/weapon/ammo.action", () => ({
  createAmmo: h.create,
  deleteAmmo: h.del,
}));
vi.mock("@/src/actions/weapon/damage.action", () => ({
  createDamage: h.create,
  deleteDamage: h.del,
}));
vi.mock("@/src/actions/weapon/range.action", () => ({
  createRange: h.create,
  deleteRange: h.del,
}));
vi.mock("@/src/actions/weapon/weaponSkill.action", () => ({
  createWeaponSkill: h.create,
  deleteWeaponSkill: h.del,
}));
vi.mock("@/src/actions/weapon/weight.action", () => ({
  createWeight: h.create,
  deleteWeight: h.del,
}));
vi.mock("@/src/actions/suggestion.action", () => ({
  createSuggestion: h.createSuggestion,
  deleteSuggestion: vi.fn(),
}));
vi.mock("@/src/actions/scenario.action", () => ({
  createScenario: h.createScenario,
}));
// Enum stand-in so the suite also runs without a generated Prisma client.
vi.mock("@prisma/client", () => ({
  SuggestionType: new Proxy({}, { get: (_t, key) => key }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.setConfig({ testTimeout: 15000 });

const attributeForms: [
  string,
  (p: { suggest: boolean }) => React.ReactElement,
][] = [
  ["AlignementForm", AlignementForm],
  ["CharacterSkillForm", CharacterSkillForm],
  ["FortuneForm", FortuneForm],
  ["StrengthForm", StrengthForm],
  ["TempermentForm", TempermentForm],
  ["WeaknessForm", WeaknessForm],
  ["AmmoForm", AmmoForm],
  ["DamageForm", DamageForm],
  ["RangeForm", RangeForm],
  ["WeaponSkillForm", WeaponSkillForm],
  ["WeightForm", WeightForm],
];

describe("attribute forms: required name", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(attributeForms)(
    "%s blocks an empty submit with a field-level message",
    async (_name, Form) => {
      const user = userEvent.setup();
      render(<Form suggest={false} />);

      await user.click(screen.getByRole("button", { name: /créer/i }));

      expect(
        await screen.findByText("Ce champ est requis"),
      ).toBeInTheDocument();
      expect(h.create).not.toHaveBeenCalled();
      expect(h.createSuggestion).not.toHaveBeenCalled();
    },
  );

  it("ScenarioForm blocks an empty submit with a field-level message", async () => {
    const user = userEvent.setup();
    render(<ScenarioForm />);

    await user.click(screen.getByRole("button", { name: /créer/i }));

    expect(await screen.findAllByText("Ce champ est requis")).not.toHaveLength(
      0,
    );
    expect(h.createScenario).not.toHaveBeenCalled();
  });
});

describe("attribute forms: a rejected action keeps the typed values", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(attributeForms)(
    "%s keeps the typed name after a serverError and clears it after success",
    async (_name, Form) => {
      const user = userEvent.setup();
      render(<Form suggest={false} />);
      const name = screen.getAllByRole("textbox")[0];

      h.create.mockResolvedValueOnce({ serverError: "Nom déjà utilisé" });
      await user.type(name, "Loyal");
      await user.click(screen.getByRole("button", { name: /créer/i }));
      await waitFor(() => expect(h.create).toHaveBeenCalledTimes(1));
      await new Promise((r) => setTimeout(r, 50));
      expect(name).toHaveValue("Loyal");

      h.create.mockResolvedValueOnce(undefined);
      await user.click(screen.getByRole("button", { name: /créer/i }));
      await waitFor(() => expect(h.create).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(name).toHaveValue(""));
    },
  );

  it("AlignementForm keeps the typed name when the suggestion is rejected", async () => {
    const user = userEvent.setup();
    render(<AlignementForm suggest />);
    const name = screen.getAllByRole("textbox")[0];

    h.createSuggestion.mockResolvedValueOnce({ serverError: "Trop" });
    await user.type(name, "Loyal");
    await user.click(screen.getByRole("button", { name: /.+/i }));
    await waitFor(() => expect(h.createSuggestion).toHaveBeenCalledTimes(1));
    await new Promise((r) => setTimeout(r, 50));

    expect(name).toHaveValue("Loyal");
  });

  it("ScenarioForm keeps the typed values after validationErrors", async () => {
    const user = userEvent.setup();
    render(<ScenarioForm />);
    const [name] = screen.getAllByRole("textbox");

    h.createScenario.mockResolvedValueOnce({ validationErrors: {} });
    await user.type(name, "Mon scénario");
    await user.type(screen.getAllByRole("textbox")[1], "Univers");
    await user.click(screen.getByRole("button", { name: /créer/i }));
    await waitFor(() => expect(h.createScenario).toHaveBeenCalledTimes(1));
    await new Promise((r) => setTimeout(r, 50));

    expect(name).toHaveValue("Mon scénario");
  });
});
