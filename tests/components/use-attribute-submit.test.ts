import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAttributeSubmit } from "@/components/form/attribute/use-attribute-submit";
import { createSuggestion } from "@/src/actions/suggestion.action";

vi.mock("@/src/actions/suggestion.action", () => ({
  createSuggestion: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

const labels = {
  authError: "Non autorisé",
  created: "Créé",
  deleted: "Supprimé",
};
const input = { name: "Loyal", description: "Never betrays" };

function setup(suggest: boolean, createResult: unknown = undefined) {
  const createAction = vi.fn().mockResolvedValue(createResult);
  const deleteAction = vi.fn().mockResolvedValue(undefined);
  const hook = renderHook(() =>
    useAttributeSubmit({
      suggest,
      suggestionType: "ALIGNMENT" as never,
      createAction,
      deleteAction,
      labels,
    }),
  );
  return { ...hook, createAction, deleteAction };
}

describe("useAttributeSubmit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("suggest path sends a suggestion, skips createAction and resets loading", async () => {
    const { result, createAction } = setup(true);

    await act(() => result.current.handleSubmit(input));

    expect(createSuggestion).toHaveBeenCalledWith({
      type: "ALIGNMENT",
      name: "Loyal",
      description: "Never betrays",
    });
    expect(createAction).not.toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalledWith("Votre suggestion a été envoyée");
    expect(result.current.isLoading).toBe(false);
  });

  it("validationErrors shows the fill-fields error and no success toast", async () => {
    const { result, createAction } = setup(false, { validationErrors: {} });

    await act(() => result.current.handleSubmit(input));

    expect(createAction).toHaveBeenCalledWith(input);
    expect(toast.error).toHaveBeenCalledWith("Veuillez remplir tous les champs");
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.success).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it("serverError shows the form's authError label", async () => {
    const { result } = setup(false, { serverError: "boom" });

    await act(() => result.current.handleSubmit(input));

    expect(toast.error).toHaveBeenCalledWith(labels.authError);
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.success).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it("success toast undo action deletes by name then confirms deletion", async () => {
    const { result, deleteAction } = setup(false);

    await act(() => result.current.handleSubmit(input));

    expect(toast.success).toHaveBeenCalledTimes(1);
    const [message, options] = vi.mocked(toast.success).mock.calls[0] as [
      string,
      { action: { label: string; onClick: () => Promise<void> } },
    ];
    expect(message).toBe(labels.created);
    expect(options.action.label).toBe("Annuler");
    expect(deleteAction).not.toHaveBeenCalled();

    await act(() => options.action.onClick());

    expect(deleteAction).toHaveBeenCalledWith({ name: "Loyal" });
    expect(toast.success).toHaveBeenLastCalledWith(labels.deleted);
    expect(result.current.isLoading).toBe(false);
  });
});
