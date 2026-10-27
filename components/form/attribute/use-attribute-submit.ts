"use client";

import { createSuggestion } from "@/src/actions/suggestion.action";
import { SuggestionType } from "@prisma/client";
import { DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";
import { useState } from "react";
import { toast } from "sonner";

type AttributeInput = { name: string; description?: string };

type SafeActionResult = {
  validationErrors?: unknown;
  serverError?: unknown;
} | void;

// "Suggest vs create, then toast + undo-delete" submit logic shared by the
// attribute forms. Each form owns its schema, fieldConfig and copy.
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

  // Returns the action result so AutoForm keeps the typed values on rejection.
  async function handleSubmit(data: TInput): Promise<SafeActionResult> {
    setIsLoading(true);
    if (suggest) {
      const suggested = await createSuggestion({
        type: suggestionType,
        name: data.name,
        description: data.description,
      });
      if (suggested?.validationErrors) {
        toast.error("Veuillez remplir tous les champs");
      } else if (suggested?.serverError) {
        toast.error(
          typeof suggested.serverError === "string" &&
            suggested.serverError !== DEFAULT_SERVER_ERROR_MESSAGE
            ? suggested.serverError
            : "Votre suggestion n'a pas pu être envoyée",
        );
      } else {
        toast.info("Votre suggestion a été envoyée");
      }
      setIsLoading(false);
      return suggested;
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
      return result;
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
    return result;
  }

  return { isLoading, handleSubmit };
}
