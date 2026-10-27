"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { createAmmo, deleteAmmo } from "@/src/actions/weapon/ammo.action";
import { SuggestionType } from "@prisma/client";
import { z } from "zod";
import { useAttributeSubmit } from "../attribute/use-attribute-submit";

export const AmmoForm = ({ suggest }: { suggest: boolean }) => {
  const { isLoading, handleSubmit } = useAttributeSubmit({
    suggest,
    suggestionType: SuggestionType.Ammo,
    createAction: createAmmo,
    deleteAction: deleteAmmo,
    labels: {
      authError: "Vous devez être connecté pour créer une munition",
      created: "Munition créé avec succès",
      deleted: "Munition supprimée avec succès",
    },
  });
  return (
    <AutoForm
      formSchema={z.object({
        name: z.string().max(50).describe("Nom de la munition"),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: "Peu de muntion",
          },
        },
      }}
      onSubmit={handleSubmit}
    >
      <AutoFormSubmit isLoading={isLoading}>
        {suggest ? "Suggérer" : "Créer la munition"}
      </AutoFormSubmit>
    </AutoForm>
  );
};
