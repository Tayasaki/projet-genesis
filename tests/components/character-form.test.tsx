import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CharacterForm } from "@/components/form/character/CharacterForm";
import { installRadixJsdomStubs } from "../helpers/radix-jsdom";

installRadixJsdomStubs();

const h = vi.hoisted(() => ({
  createCharacter: vi.fn(),
  updateCharacter: vi.fn(),
  generateCharacter: vi.fn(),
  push: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/src/actions/character/character.action", () => ({
  createCharacter: h.createCharacter,
  updateCharacter: h.updateCharacter,
  generateCharacter: h.generateCharacter,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.push }),
}));
vi.mock("sonner", () => ({
  toast: { success: h.toastSuccess, error: h.toastError },
}));

const named = (...names: string[]) =>
  names.map((name, i) => ({ id: `${name}-${i}`, name }));

function props(overrides: Record<string, unknown> = {}) {
  return {
    temperments: named("Calme", "Colérique"),
    strengths: named("Force"),
    weaknesses: named("Lenteur"),
    characterSkills: named("Escalade"),
    weapons: [],
    alignements: named("Loyal", "Chaotique"),
    fortunes: named("Pauvre", "Riche"),
    scenarioId: "scn-1",
    autoGeneration: false,
    ...overrides,
  } as unknown as ComponentProps<typeof CharacterForm>;
}

async function choose(
  user: ReturnType<typeof userEvent.setup>,
  index: number,
  option: string,
) {
  await user.click(screen.getAllByRole("combobox")[index]);
  await user.click(await screen.findByRole("option", { name: option }));
}

describe("CharacterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.createCharacter.mockResolvedValue({ data: { ok: true } });
    h.updateCharacter.mockResolvedValue({ data: { ok: true } });
  });

  it("shows a placeholder on every unselected enum select on create", () => {
    render(<CharacterForm {...props()} />);

    const triggers = screen.getAllByRole("combobox");
    expect(triggers).toHaveLength(3);
    for (const trigger of triggers) {
      expect(trigger).toHaveTextContent("Sélectionner une option");
    }
  });

  it("shows a validation message and does not submit when enums are unselected", async () => {
    const user = userEvent.setup();
    render(<CharacterForm {...props()} />);

    await user.type(screen.getByLabelText(/nom du personnage/i), "Eric");
    await user.click(
      screen.getByRole("button", { name: "Créer votre personnage" }),
    );

    expect(
      await screen.findAllByText("Veuillez choisir une valeur"),
    ).toHaveLength(3);
    expect(h.createCharacter).not.toHaveBeenCalled();
  });

  it("shows a field-level message for an empty name and does not create", async () => {
    const user = userEvent.setup();
    render(<CharacterForm {...props()} />);

    await choose(user, 0, "Colérique");
    await choose(user, 1, "Chaotique");
    await choose(user, 2, "Riche");
    await user.click(
      screen.getByRole("button", { name: "Créer votre personnage" }),
    );

    expect(await screen.findByText("Ce champ est requis")).toBeInTheDocument();
    expect(h.createCharacter).not.toHaveBeenCalled();
  });

  it("keeps the validation messages visible after the blocked submit settles", async () => {
    const user = userEvent.setup();
    render(<CharacterForm {...props()} />);

    await user.click(
      screen.getByRole("button", { name: "Créer votre personnage" }),
    );
    await screen.findAllByText("Veuillez choisir une valeur");
    await new Promise((r) => setTimeout(r, 50));

    expect(screen.getAllByText("Veuillez choisir une valeur")).toHaveLength(3);
  });

  it("clears the message once a value is chosen and submits the selection", async () => {
    const user = userEvent.setup();
    render(<CharacterForm {...props()} />);

    await user.type(screen.getByLabelText(/nom du personnage/i), "Eric");
    await choose(user, 0, "Colérique");
    await choose(user, 1, "Chaotique");
    await choose(user, 2, "Riche");
    await user.click(
      screen.getByRole("button", { name: "Créer votre personnage" }),
    );

    await waitFor(() => expect(h.createCharacter).toHaveBeenCalledTimes(1));
    expect(h.createCharacter).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Eric",
        temperment: "Colérique",
        alignment: "Chaotique",
        fortune: "Riche",
        scenarioId: "scn-1",
      }),
    );
    await waitFor(() =>
      expect(h.push).toHaveBeenCalledWith("/scn-1/characters"),
    );
    expect(screen.queryByText("Veuillez choisir une valeur")).toBeNull();
  });

  it("prefills the enum selects from the existing character in edit mode", async () => {
    const user = userEvent.setup();
    const character = {
      id: "c1",
      name: "Gandalf",
      pj: true,
      origin: null,
      role: null,
      age: 30,
      injury: null,
      extra: null,
      temperment: { name: "Colérique" },
      alignment: { name: "Loyal" },
      fortune: { name: "Pauvre" },
    };
    render(<CharacterForm {...props({ character, modify: true })} />);

    const [temperment, alignment, fortune] = screen.getAllByRole("combobox");
    expect(temperment).toHaveTextContent("Colérique");
    expect(alignment).toHaveTextContent("Loyal");
    expect(fortune).toHaveTextContent("Pauvre");
    expect(screen.getByLabelText(/nom du personnage/i)).toHaveValue("Gandalf");

    await user.click(
      screen.getByRole("button", { name: "Modifier votre personnage" }),
    );
    await waitFor(() => expect(h.updateCharacter).toHaveBeenCalledTimes(1));
    expect(h.updateCharacter).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "c1",
        name: "Gandalf",
        age: 30,
        temperment: "Colérique",
        alignment: "Loyal",
        fortune: "Pauvre",
      }),
    );
    expect(
      within(document.body).queryByText("Veuillez choisir une valeur"),
    ).toBeNull();
  });

  it.each([
    ["a serverError", { serverError: "Non autorisé" }],
    ["validationErrors", { validationErrors: { name: ["bad"] } }],
  ])(
    "keeps the typed values and does not navigate when create returns %s",
    async (_, result) => {
      const user = userEvent.setup();
      h.createCharacter.mockResolvedValue(result);
      render(<CharacterForm {...props()} />);

      await user.type(screen.getByLabelText(/nom du personnage/i), "Eric");
      await choose(user, 0, "Colérique");
      await choose(user, 1, "Chaotique");
      await choose(user, 2, "Riche");
      await user.click(
        screen.getByRole("button", { name: "Créer votre personnage" }),
      );

      await waitFor(() => expect(h.createCharacter).toHaveBeenCalledTimes(1));
      await new Promise((r) => setTimeout(r, 100));

      expect(screen.getByLabelText(/nom du personnage/i)).toHaveValue("Eric");
      const [temperment, alignment, fortune] = screen.getAllByRole("combobox");
      expect(temperment).toHaveTextContent("Colérique");
      expect(alignment).toHaveTextContent("Chaotique");
      expect(fortune).toHaveTextContent("Riche");
      // CharacterForm re-feeds `values`, so a reset would restore the same
      // data: only the missing navigation distinguishes the rejection here.
      expect(h.push).not.toHaveBeenCalled();
    },
    30000,
  );
});
