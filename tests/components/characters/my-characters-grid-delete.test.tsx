import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ deleteCharacter: vi.fn() }));

vi.mock("@/src/actions/character/character.action", () => ({
  deleteCharacter: h.deleteCharacter,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { MyCharactersGrid } from "@/app/(app)/characters/MyCharactersGrid";
import type { CharacterScenario } from "@/src/query/character.query";

const character = {
  id: "char-1",
  name: "Aria",
  image: null,
  role: "Éclaireuse",
  origin: null,
  age: null,
  injury: null,
  pj: true,
  temperment: null,
  alignment: null,
  fortune: null,
} as unknown as CharacterScenario;

async function openDialog() {
  render(<MyCharactersGrid characters={[character]} />);
  await userEvent.click(screen.getByRole("button", { name: "Supprimer Aria" }));
  return within(await screen.findByRole("alertdialog"));
}

async function confirm() {
  const dialog = await openDialog();
  await userEvent.click(dialog.getByRole("button", { name: "Supprimer" }));
}

beforeEach(() => {
  vi.clearAllMocks();
  h.deleteCharacter.mockResolvedValue(undefined);
});

describe("MyCharactersGrid delete", () => {
  it("deletes the character by id and confirms with a success toast", async () => {
    await confirm();

    await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
    expect(h.deleteCharacter).toHaveBeenCalledTimes(1);
    expect(h.deleteCharacter).toHaveBeenCalledWith({ id: "char-1" });
    expect(toast.success).toHaveBeenCalledWith("Aria supprimé");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it.each([
    ["serverError", { serverError: "boom" }],
    ["validationErrors", { validationErrors: { id: ["bad"] } }],
  ])(
    "reports a failed delete instead of a success when the action returns %s",
    async (_kind, failure) => {
      h.deleteCharacter.mockResolvedValue(failure);

      await confirm();

      await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
      expect(toast.error).toHaveBeenCalledWith("La suppression a échoué");
      expect(toast.success).not.toHaveBeenCalled();
    },
  );

  it("does not delete when the dialog is cancelled", async () => {
    const dialog = await openDialog();
    await userEvent.click(dialog.getByRole("button", { name: "Annuler" }));

    expect(h.deleteCharacter).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
