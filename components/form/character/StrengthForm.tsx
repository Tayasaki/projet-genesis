import {
  createStrength,
  deleteStrength,
} from "@/src/actions/character/strength.action";
import { SuggestionType } from "@prisma/client";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";
import { useAttributeSubmit } from "../attribute/use-attribute-submit";

export const StrengthForm = ({ suggest }: { suggest: boolean }) => {
  const { isLoading, handleSubmit } = useAttributeSubmit({
    suggest,
    suggestionType: SuggestionType.Strength,
    createAction: createStrength,
    deleteAction: deleteStrength,
    labels: {
      authError: "Vous devez être connecté pour créer une force",
      created: "Force créé avec succès",
      deleted: "Force supprimé avec succès",
    },
  });
  return (
    <AutoForm
      formSchema={z.object({
        name: z.string().max(50).describe("Nom du la force"),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: "Force de l'ours",
          },
        },
      }}
      onSubmit={handleSubmit}
    >
      <AutoFormSubmit isLoading={isLoading}>
        {suggest ? "Suggérer" : "Créer la force"}
      </AutoFormSubmit>
    </AutoForm>
  );
};
