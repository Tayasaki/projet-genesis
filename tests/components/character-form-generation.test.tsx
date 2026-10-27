import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "../helpers/radix-jsdom";

const { generateCharacter, toast } = vi.hoisted(() => ({
  generateCharacter: vi.fn(),
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("sonner", () => ({ toast }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/src/actions/character/character.action", () => ({
  generateCharacter,
  createCharacter: vi.fn(),
  updateCharacter: vi.fn(),
}));
vi.mock("@/components/ui/auto-form", () => ({
  default: () => null,
  AutoFormSubmit: () => null,
}));

import { CharacterForm } from "@/components/form/character/CharacterForm";
import {
  GENERATION_RATE_LIMIT,
  MAX_GENERATION_PROMPT_LENGTH,
} from "@/src/actions/character/generation-limits";

async function submitPrompt() {
  render(
    <CharacterForm
      temperments={[]}
      strengths={[]}
      weaknesses={[]}
      characterSkills={[]}
      weapons={[]}
      alignements={[]}
      fortunes={[]}
      autoGeneration
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: /Générer/ }));
  const input = await screen.findByPlaceholderText("Message...");
  expect(input).toHaveAttribute(
    "maxlength",
    String(MAX_GENERATION_PROMPT_LENGTH),
  );
  await userEvent.type(input, "un voleur");
  await userEvent.tab();
  await userEvent.click(screen.getByRole("menuitem", { name: /C'est parti/ }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CharacterForm AI generation feedback", () => {
  it("tells the user when the hourly limit is reached", async () => {
    generateCharacter.mockResolvedValue({ data: { type: "rate-limited" } });
    await submitPrompt();

    expect(toast.error).toHaveBeenCalledWith(
      `Limite atteinte : ${GENERATION_RATE_LIMIT} générations par heure, réessayez plus tard.`,
    );
  });

  it("shows the validation message for an invalid prompt", async () => {
    generateCharacter.mockResolvedValue({
      validationErrors: { message: { _errors: ["Message trop long"] } },
    });
    await submitPrompt();

    expect(toast.error).toHaveBeenCalledWith("Message trop long");
  });

  it("shows a generic error on a server error", async () => {
    generateCharacter.mockResolvedValue({ serverError: "boom" });
    await submitPrompt();

    expect(toast.error).toHaveBeenCalledWith(
      "Erreur lors de la génération du personnage",
    );
  });

  it("keeps the AI validation-error toast", async () => {
    generateCharacter.mockResolvedValue({ data: { type: "validation-error" } });
    await submitPrompt();

    expect(toast.error).toHaveBeenCalledWith(
      "L'IA n'a pas pu générer de personnage",
    );
  });
});
