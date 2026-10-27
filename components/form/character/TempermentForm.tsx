"use client";

import {
  createTemperment,
  deleteTemperment,
} from "@/src/actions/character/temperment.action";
import { SuggestionType } from "@prisma/client";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";
import { useAttributeSubmit } from "../attribute/use-attribute-submit";

export const TempermentForm = ({ suggest }: { suggest: boolean }) => {
  const { isLoading, handleSubmit } = useAttributeSubmit({
    suggest,
    suggestionType: SuggestionType.Temperment,
    createAction: createTemperment,
    deleteAction: deleteTemperment,
    labels: {
      authError: "Vous devez être connecté pour créer un tempérament",
      created: "Tempérament créé avec succès",
      deleted: "Tempérament supprimé avec succès",
    },
  });
  return (
    <AutoForm
      formSchema={z.object({
        name: z.string().max(50).describe("Nom du tempérament"),
        description: z
          .string()
          .max(200)
          .optional()
          .describe("Description du tempérament"),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: "Colérique",
          },
        },
        description: {
          inputProps: {
            placeholder:
              "Le colérique est une personne qui s'énerve facilement",
          },
        },
      }}
      onSubmit={handleSubmit}
    >
      <AutoFormSubmit isLoading={isLoading}>
        {suggest ? "Suggérer" : "Créer le tempérament"}
      </AutoFormSubmit>
    </AutoForm>
  );
};
