"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { createDamage, deleteDamage } from "@/src/actions/weapon/damage.action";
import { SuggestionType } from "@prisma/client";
import { z } from "zod";
import { useAttributeSubmit } from "../attribute/use-attribute-submit";

export const DamageForm = ({ suggest }: { suggest: boolean }) => {
  const { isLoading, handleSubmit } = useAttributeSubmit({
    suggest,
    suggestionType: SuggestionType.Damage,
    createAction: createDamage,
    deleteAction: deleteDamage,
    labels: {
      authError: "Vous devez être connecté pour créer un dégât",
      created: "Dégât créé avec succès",
      deleted: "Dégât supprimé avec succès",
    },
  });
  return (
    <AutoForm
      formSchema={z.object({
        name: z.string().max(50).describe("Nom du dégât"),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: "Peu de dégât",
          },
        },
      }}
      onSubmit={handleSubmit}
    >
      <AutoFormSubmit isLoading={isLoading}>
        {suggest ? "Suggérer" : "Créer le dégât"}
      </AutoFormSubmit>
    </AutoForm>
  );
};
