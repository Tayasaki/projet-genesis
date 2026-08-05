"use client";

import {
  createAlignment,
  deleteAlignment,
} from "@/src/actions/character/alignment.action";
import { SuggestionType } from "@prisma/client";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";
import { useAttributeSubmit } from "../attribute/use-attribute-submit";

export const AlignementForm = ({ suggest }: { suggest: boolean }) => {
  const { isLoading, handleSubmit } = useAttributeSubmit({
    suggest,
    suggestionType: SuggestionType.Alignment,
    createAction: createAlignment,
    deleteAction: deleteAlignment,
    labels: {
      authError: "Vous devez être connecté pour créer un alignement",
      created: "Alignement créé avec succès",
      deleted: "Alignement supprimé avec succès",
    },
  });
  return (
    <AutoForm
      formSchema={z.object({
        name: z.string().max(50).describe("Nom de l'alignement"),
        description: z
          .string()
          .max(200)
          .optional()
          .describe("Description de l'alignement"),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: "Loyal bon",
          },
        },
        description: {
          inputProps: {
            placeholder: "Un personnage loyal bon agit comme un chevalier",
          },
        },
      }}
      onSubmit={handleSubmit}
    >
      <AutoFormSubmit isLoading={isLoading}>
        {suggest ? "Suggérer" : "Créer le alignement"}
      </AutoFormSubmit>
    </AutoForm>
  );
};
