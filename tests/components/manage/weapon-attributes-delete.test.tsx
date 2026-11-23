import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  deleteAmmo: vi.fn(),
  deleteDamage: vi.fn(),
  deleteRange: vi.fn(),
  deleteWeight: vi.fn(),
  deleteWeaponSkill: vi.fn(),
}));

vi.mock("@/src/actions/weapon/ammo.action", () => ({
  deleteAmmo: h.deleteAmmo,
}));
vi.mock("@/src/actions/weapon/damage.action", () => ({
  deleteDamage: h.deleteDamage,
}));
vi.mock("@/src/actions/weapon/range.action", () => ({
  deleteRange: h.deleteRange,
}));
vi.mock("@/src/actions/weapon/weight.action", () => ({
  deleteWeight: h.deleteWeight,
}));
vi.mock("@/src/actions/weapon/weaponSkill.action", () => ({
  deleteWeaponSkill: h.deleteWeaponSkill,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { WeaponAttributesTable } from "@/app/(app)/manage/weaponAttributesColumns";

import { describeAttributeDelete } from "./attribute-delete-suite";

// The weapon table shares the `skill` type with the character table but must
// dispatch it to deleteWeaponSkill; the character action modules are
// deliberately not mocked here so reaching them would fail the suite.
describeAttributeDelete({
  name: "WeaponAttributesTable delete dispatch",
  Table: WeaponAttributesTable,
  pageKey: "weaponAttributes",
  mocks: {
    ammo: h.deleteAmmo,
    damage: h.deleteDamage,
    range: h.deleteRange,
    weight: h.deleteWeight,
    skill: h.deleteWeaponSkill,
  },
  labels: {
    ammo: "Munition",
    damage: "Dégât",
    range: "Porté",
    weight: "Poids",
    skill: "compétence",
  },
  expectedPageTypeCount: 5,
});

describe("WeaponAttributesTable delete of an entry still used by a weapon", () => {
  it("toasts the specific server message instead of the generic one", async () => {
    const message = "Still used by weapons";
    h.deleteDamage.mockResolvedValue({ serverError: message });
    render(
      <WeaponAttributesTable
        title="weapon attributes"
        data={[{ id: "1", name: "Slash", type: "damage", description: null }]}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Supprimer Slash" }),
    );
    const dialog = within(await screen.findByRole("alertdialog"));
    await userEvent.click(dialog.getByRole("button", { name: "Supprimer" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
  });
});
