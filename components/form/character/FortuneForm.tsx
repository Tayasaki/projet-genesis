import {
  createFortune,
  deleteFortune,
} from "@/src/actions/character/fortune.action";
import { SuggestionType } from "@prisma/client";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";
import { useAttributeSubmit } from "../attribute/use-attribute-submit";

export const FortuneForm = ({ suggest }: { suggest: boolean }) => {
  const { isLoading, handleSubmit } = useAttributeSubmit({
    suggest,
    suggestionType: SuggestionType.Fortune,
    createAction: createFortune,
    deleteAction: deleteFortune,
    labels: {
      authError: "Vous devez être connecté pour créer une richesse",
      created: "Richesse créé avec succès",
      deleted: "Richesse supprimée avec succès",
    },
  });
  return (
    <AutoForm
      formSchema={z.object({
        name: z.string().max(50).describe("Nom de la richesse"),
        description: z
          .string()
          .max(200)
          .optional()
          .describe("Description de la richesse"),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: "Riche comme Crésus",
          },
        },
        description: {
          inputProps: {
            placeholder: "Le personnage est riche comme Crésus",
          },
        },
      }}
      onSubmit={handleSubmit}
    >
      <AutoFormSubmit isLoading={isLoading}>
        {suggest ? "Suggérer" : "Créer la fortune"}
      </AutoFormSubmit>
    </AutoForm>
  );
};
