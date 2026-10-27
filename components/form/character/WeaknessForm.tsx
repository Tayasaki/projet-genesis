import {
  createWeakness,
  deleteWeakness,
} from "@/src/actions/character/weakness.action";
import { SuggestionType } from "@prisma/client";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";
import { useAttributeSubmit } from "../attribute/use-attribute-submit";

export const WeaknessForm = ({ suggest }: { suggest: boolean }) => {
  const { isLoading, handleSubmit } = useAttributeSubmit({
    suggest,
    suggestionType: SuggestionType.Weakness,
    createAction: createWeakness,
    deleteAction: deleteWeakness,
    labels: {
      authError: "Vous devez être connecté pour créer une faiblesse",
      created: "Faiblesse créé avec succès",
      deleted: "Faiblesse supprimée avec succès",
    },
  });
  return (
    <AutoForm
      formSchema={z.object({
        name: z.string().max(50).describe("Nom de la faiblesse"),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: "Faible comme un chaton",
          },
        },
      }}
      onSubmit={handleSubmit}
    >
      <AutoFormSubmit isLoading={isLoading}>
        {suggest ? "Suggérer" : "Créer la faiblesse"}
      </AutoFormSubmit>
    </AutoForm>
  );
};
