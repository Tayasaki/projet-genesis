"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { createRange, deleteRange } from "@/src/actions/weapon/range.action";
import { SuggestionType } from "@prisma/client";
import { z } from "zod";
import { useAttributeSubmit } from "../attribute/use-attribute-submit";

export const RangeForm = ({ suggest }: { suggest: boolean }) => {
  const { isLoading, handleSubmit } = useAttributeSubmit({
    suggest,
    suggestionType: SuggestionType.Range,
    createAction: createRange,
    deleteAction: deleteRange,
    labels: {
      authError: "Vous devez être connecté pour créer une porté",
      created: "Porté créé avec succès",
      deleted: "Porté supprimée avec succès",
    },
  });
  return (
    <AutoForm
      formSchema={z.object({
        name: z.string().max(50).describe("Nom de la porté"),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: "Faible porté",
          },
        },
      }}
      onSubmit={handleSubmit}
    >
      <AutoFormSubmit isLoading={isLoading}>
        {suggest ? "Suggérer" : "Créer la porté"}
      </AutoFormSubmit>
    </AutoForm>
  );
};
