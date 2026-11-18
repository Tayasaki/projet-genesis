import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ deleteWeapon: vi.fn() }));

vi.mock("@/src/actions/weapon/weapon.action", () => ({
  deleteWeapon: h.deleteWeapon,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { WeaponsTable } from "@/app/(app)/manage/weaponColumns";
import type { Weapon } from "@/src/query/weapon.query";

const weapon = {
  id: "weapon-1",
  name: "Épée longue",
  melee: true,
  description: null,
  damage: { name: "d8" },
  range: { name: "Contact" },
  weight: { name: "Lourd" },
  ammo: null,
} as unknown as Weapon;

async function openDialog() {
  render(<WeaponsTable data={[weapon]} title="Armes" />);
  await userEvent.click(
    screen.getByRole("button", { name: "Supprimer Épée longue" }),
  );
  return within(await screen.findByRole("alertdialog"));
}

async function confirm() {
  const dialog = await openDialog();
  await userEvent.click(dialog.getByRole("button", { name: "Supprimer" }));
}

beforeEach(() => {
  vi.clearAllMocks();
  h.deleteWeapon.mockResolvedValue(undefined);
});

describe("WeaponsTable delete", () => {
  it("deletes the weapon by id and confirms with a success toast", async () => {
    await confirm();

    await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
    expect(h.deleteWeapon).toHaveBeenCalledTimes(1);
    expect(h.deleteWeapon).toHaveBeenCalledWith({ id: "weapon-1" });
    expect(toast.success).toHaveBeenCalledWith("Épée longue supprimé");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it.each([
    ["serverError", { serverError: "boom" }],
    ["validationErrors", { validationErrors: { id: ["bad"] } }],
  ])(
    "reports a failed delete instead of a success when the action returns %s",
    async (_kind, failure) => {
      h.deleteWeapon.mockResolvedValue(failure);

      await confirm();

      await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
      expect(toast.error).toHaveBeenCalledWith("La suppression a échoué");
      expect(toast.success).not.toHaveBeenCalled();
    },
  );

  it("does not delete when the dialog is cancelled", async () => {
    const dialog = await openDialog();
    await userEvent.click(dialog.getByRole("button", { name: "Annuler" }));

    expect(h.deleteWeapon).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
