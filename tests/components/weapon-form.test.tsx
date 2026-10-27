import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WeaponForm } from "@/components/form/weapon/WeaponForm";
import { installRadixJsdomStubs } from "../helpers/radix-jsdom";

installRadixJsdomStubs();

const h = vi.hoisted(() => ({
  createWeapon: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/src/actions/weapon/weapon.action", () => ({
  createWeapon: h.createWeapon,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("sonner", () => ({
  toast: { success: h.toastSuccess, error: h.toastError },
}));
// Enum stand-in so the suite also runs without a generated Prisma client.
vi.mock("@prisma/client", () => ({
  SuggestionType: new Proxy({}, { get: (_t, key) => key }),
}));

const named = (...names: string[]) =>
  names.map((name, i) => ({ id: `${name}-${i}`, name }));

function props() {
  return {
    ammos: named("Flèche"),
    weights: named("Léger", "Lourd"),
    ranges: named("Courte", "Longue"),
    damages: named("Faible", "Fort"),
    skills: named("Archerie"),
  } as unknown as ComponentProps<typeof WeaponForm>;
}

async function choose(
  user: ReturnType<typeof userEvent.setup>,
  index: number,
  option: string,
) {
  await user.click(screen.getAllByRole("combobox")[index]);
  await user.click(await screen.findByRole("option", { name: option }));
}

async function fillAndSubmit() {
  const user = userEvent.setup();
  render(<WeaponForm {...props()} />);
  await user.type(screen.getByLabelText(/nom de l'arme/i), "Excalibur");
  await choose(user, 0, "Lourd");
  await choose(user, 1, "Longue");
  await choose(user, 2, "Fort");
  await user.click(screen.getByRole("button", { name: /créer l'arme/i }));
  await waitFor(() => expect(h.createWeapon).toHaveBeenCalledTimes(1));
  await new Promise((r) => setTimeout(r, 100));
}

describe("WeaponForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("submits the chosen values, confirms and resets after success", async () => {
    h.createWeapon.mockResolvedValue({ data: { ok: true } });

    await fillAndSubmit();

    expect(h.createWeapon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Excalibur",
        weight: "Lourd",
        range: "Longue",
        damage: "Fort",
      }),
    );
    expect(h.toastSuccess).toHaveBeenCalledWith("Arme créé avec succès");
    await waitFor(() =>
      expect(screen.getByLabelText(/nom de l'arme/i)).toHaveValue(""),
    );
  }, 30000);

  it.each([
    ["a serverError", { serverError: "Non autorisé" }, "connecté"],
    ["validationErrors", { validationErrors: { name: ["bad"] } }, "remplir"],
  ])(
    "keeps the typed values and shows an error when create returns %s",
    async (_, result, toastPart) => {
      h.createWeapon.mockResolvedValue(result);

      await fillAndSubmit();

      expect(h.toastError).toHaveBeenCalledWith(
        expect.stringContaining(toastPart),
      );
      expect(h.toastSuccess).not.toHaveBeenCalled();
      expect(screen.getByLabelText(/nom de l'arme/i)).toHaveValue("Excalibur");
      const [weight, range, damage] = screen.getAllByRole("combobox");
      expect(weight).toHaveTextContent("Lourd");
      expect(range).toHaveTextContent("Longue");
      expect(damage).toHaveTextContent("Fort");
    },
    30000,
  );
});
