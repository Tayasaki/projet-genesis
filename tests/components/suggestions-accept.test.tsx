import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  createAlignment: vi.fn(),
  deleteSuggestion: vi.fn(),
}));

vi.mock("@/src/actions/suggestion.action", () => ({
  deleteSuggestion: h.deleteSuggestion,
}));
vi.mock("@/src/actions/character/alignment.action", () => ({
  createAlignment: h.createAlignment,
}));
vi.mock("@/src/actions/character/characterSkill.action", () => ({
  createCharacterSkill: vi.fn(),
}));
vi.mock("@/src/actions/character/fortune.action", () => ({
  createFortune: vi.fn(),
}));
vi.mock("@/src/actions/character/strength.action", () => ({
  createStrength: vi.fn(),
}));
vi.mock("@/src/actions/character/temperment.action", () => ({
  createTemperment: vi.fn(),
}));
vi.mock("@/src/actions/character/weakness.action", () => ({
  createWeakness: vi.fn(),
}));
vi.mock("@/src/actions/weapon/ammo.action", () => ({ createAmmo: vi.fn() }));
vi.mock("@/src/actions/weapon/damage.action", () => ({
  createDamage: vi.fn(),
}));
vi.mock("@/src/actions/weapon/range.action", () => ({ createRange: vi.fn() }));
vi.mock("@/src/actions/weapon/weaponSkill.action", () => ({
  createWeaponSkill: vi.fn(),
}));
vi.mock("@/src/actions/weapon/weight.action", () => ({
  createWeight: vi.fn(),
}));
vi.mock("@/components/features/layout/DeleteDialog", () => ({
  DeleteDialog: () => null,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { columns } from "@/app/suggestions/suggestionsColumns";

function renderAcceptButton() {
  const actions = columns.find((c) => c.id === "actions");
  const cell = actions?.cell as (ctx: unknown) => React.ReactElement;
  const original = { type: "Alignment", name: "Loyal", description: "d" };
  render(cell({ row: { original } }));
  fireEvent.click(screen.getByRole("button", { name: "Accepter" }));
}

beforeEach(() => {
  vi.clearAllMocks();
  h.createAlignment.mockResolvedValue({ data: undefined });
  h.deleteSuggestion.mockResolvedValue({ data: undefined });
});

describe("Accepter handler", () => {
  it("creates the catalog entry, then deletes the suggestion", async () => {
    renderAcceptButton();

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(h.createAlignment).toHaveBeenCalledWith({
      name: "Loyal",
      description: "d",
    });
    expect(h.deleteSuggestion).toHaveBeenCalledWith({ name: "Loyal" });
    expect(h.createAlignment.mock.invocationCallOrder[0]).toBeLessThan(
      h.deleteSuggestion.mock.invocationCallOrder[0],
    );
  });

  it.each([
    ["a server error", { serverError: "boom" }],
    ["validation errors", { validationErrors: { name: { _errors: ["x"] } } }],
  ])("keeps the suggestion when the create returns %s", async (_, result) => {
    h.createAlignment.mockResolvedValue(result);

    renderAcceptButton();

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(h.deleteSuggestion).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("keeps the suggestion when the create throws", async () => {
    h.createAlignment.mockRejectedValue(new Error("network"));

    renderAcceptButton();

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(h.deleteSuggestion).not.toHaveBeenCalled();
  });

  it("reports an error, not success, when the delete fails", async () => {
    h.deleteSuggestion.mockResolvedValue({ serverError: "denied" });

    renderAcceptButton();

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.success).not.toHaveBeenCalled();
  });
});
