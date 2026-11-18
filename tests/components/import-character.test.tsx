import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Character } from "@prisma/client";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { installRadixJsdomStubs } from "../helpers/radix-jsdom";

installRadixJsdomStubs();

const h = vi.hoisted(() => ({
  updateScenarioCharacter: vi.fn(),
}));

vi.mock("@/src/actions/scenario.action", () => ({
  updateScenarioCharacter: h.updateScenarioCharacter,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { ImportCharacter } from "@/components/features/layout/ImportCharacter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const SCENARIO_ID = "scn-1";

function makeCharacter(id: string, name: string): Character {
  return {
    id,
    name,
    pj: false,
    age: null,
    image: null,
    origin: null,
    role: null,
    injury: null,
    extra: null,
    userId: "user-1",
    fortuneId: null,
    alignmentId: null,
    tempermentId: null,
  };
}

const alice = makeCharacter("char-a", "Alice");
const bob = makeCharacter("char-b", "Bob");

function renderImport(characterList: Character[]) {
  render(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogTitle>Importer</DialogTitle>
        <DialogDescription>Choisir des personnages</DialogDescription>
        <ImportCharacter
          characterList={characterList}
          scenarioId={SCENARIO_ID}
        />
      </DialogContent>
    </Dialog>,
  );
}

function checkboxOf(name: string) {
  const header = screen.getByText(name).parentElement as HTMLElement;
  return within(header).getByRole("checkbox");
}

beforeEach(() => {
  vi.clearAllMocks();
  h.updateScenarioCharacter.mockResolvedValue({ data: undefined });
});

describe("ImportCharacter", () => {
  it("imports every selected character and toasts a success for each", async () => {
    const user = userEvent.setup();
    renderImport([alice, bob]);

    await user.click(screen.getByText("Alice"));
    await user.click(checkboxOf("Bob"));
    await user.click(screen.getByRole("button", { name: "Importer" }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(2));
    expect(h.updateScenarioCharacter).toHaveBeenCalledTimes(2);
    expect(h.updateScenarioCharacter).toHaveBeenNthCalledWith(1, {
      scenarioId: SCENARIO_ID,
      characterId: "char-a",
    });
    expect(h.updateScenarioCharacter).toHaveBeenNthCalledWith(2, {
      scenarioId: SCENARIO_ID,
      characterId: "char-b",
    });
    expect(toast.success).toHaveBeenNthCalledWith(
      1,
      "Alice a été importé avec succès 🧙",
    );
    expect(toast.success).toHaveBeenNthCalledWith(
      2,
      "Bob a été importé avec succès 🧙",
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("toasts one error and one success when only one import fails", async () => {
    h.updateScenarioCharacter
      .mockResolvedValueOnce({ serverError: "boom" })
      .mockResolvedValueOnce({ data: undefined });
    const user = userEvent.setup();
    renderImport([alice, bob]);

    await user.click(screen.getByText("Alice"));
    await user.click(screen.getByText("Bob"));
    await user.click(screen.getByRole("button", { name: "Importer" }));

    await waitFor(() =>
      expect(h.updateScenarioCharacter).toHaveBeenCalledTimes(2),
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith("Une erreur est survenue");
    expect(toast.success).toHaveBeenCalledWith(
      "Bob a été importé avec succès 🧙",
    );
  });

  it("toggles the selection exactly once when the checkbox inside a card is clicked", async () => {
    const user = userEvent.setup();
    renderImport([alice, bob]);

    await user.click(checkboxOf("Alice"));

    expect(checkboxOf("Alice")).toHaveAttribute("aria-checked", "true");
    expect(checkboxOf("Bob")).toHaveAttribute("aria-checked", "false");
    expect(h.updateScenarioCharacter).not.toHaveBeenCalled();

    await user.click(checkboxOf("Alice"));

    expect(checkboxOf("Alice")).toHaveAttribute("aria-checked", "false");
  });

  it("shows the empty state and no checkbox when there is no character", () => {
    renderImport([]);

    expect(screen.getByText("Aucun personnage trouvé")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("keeps the Import button disabled until a character is selected", async () => {
    const user = userEvent.setup();
    renderImport([alice]);

    expect(screen.getByRole("button", { name: "Importer" })).toBeDisabled();

    await user.click(screen.getByText("Alice"));

    expect(screen.getByRole("button", { name: "Importer" })).toBeEnabled();
  });
});
