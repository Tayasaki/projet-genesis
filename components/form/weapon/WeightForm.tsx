"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { createWeight, deleteWeight } from "@/src/actions/weapon/weight.action";
import { SuggestionType } from "@prisma/client";
import { z } from "zod";
import { useAttributeSubmit } from "../attribute/use-attribute-submit";

export const WeightForm = ({ suggest }: { suggest: boolean }) => {
  const { isLoading, handleSubmit } = useAttributeSubmit({
    suggest,
    suggestionType: SuggestionType.Weight,
    createAction: createWeight,
    deleteAction: deleteWeight,
    labels: {
      authError: "Vous devez être connecté pour créer un poids",
      created: "Poids créé avec succès",
      deleted: "Poids supprimé avec succès",
    },
  });
  return (
    <AutoForm
      formSchema={z.object({
        name: z.string().max(50).describe("Nom du poids"),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: "Très lourd",
          },
        },
      }}
      onSubmit={handleSubmit}
    >
      <AutoFormSubmit isLoading={isLoading}>
        {suggest ? "Suggérer" : "Créer le poids"}
      </AutoFormSubmit>
    </AutoForm>
  );
};
