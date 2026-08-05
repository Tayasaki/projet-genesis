"use client";

import { createSuggestion } from "@/src/actions/suggestion.action";
import { SuggestionType } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";

type AttributeInput = { name: string; description?: string };

type SafeActionResult = {
  validationErrors?: unknown;
  serverError?: unknown;
} | void;

// Shared "suggest vs create, then toast + undo-delete" submit logic behind
// the 11 attribute forms (alignment, temperment, fortune, strength,
// weakness, characterSkill, ammo, damage, range, weaponSkill, weight).
// Each form keeps its own schema/fieldConfig/copy — only this logic,
// which was byte-for-byte identical across all 11, is shared.
export function useAttributeSubmit<TInput extends AttributeInput>({
  suggest,
  suggestionType,
  createAction,
  deleteAction,
  labels,
}: {
  suggest: boolean;
  suggestionType: SuggestionType;
  createAction: (input: TInput) => Promise<SafeActionResult>;
  deleteAction: (input: { name: string }) => Promise<SafeActionResult>;
  labels: { authError: string; created: string; deleted: string };
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: TInput) {
    setIsLoading(true);
    if (suggest) {
      await createSuggestion({
        type: suggestionType,
        name: data.name,
        description: data.description,
      });
      toast.info("Votre suggestion a été envoyée");
      setIsLoading(false);
      return;
    }

    const result = await createAction(data);
    if (result?.validationErrors || result?.serverError) {
      if (result.validationErrors) {
        toast.error("Veuillez remplir tous les champs");
      }
      if (result.serverError) {
        toast.error(labels.authError);
      }
      setIsLoading(false);
      return;
    }

    toast.success(labels.created, {
      action: {
        label: "Annuler",
        onClick: async () => {
          await deleteAction({ name: data.name });
          toast.success(labels.deleted);
        },
      },
    });
    setIsLoading(false);
  }

  return { isLoading, handleSubmit };
}
