"use client";

import {
  createAlignment,
  deleteAlignment,
} from "@/src/actions/character/alignment.action";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";
import { createSuggestion } from "@/src/actions/suggestion.action";
import { SuggestionType } from "@prisma/client";

export const AlignementForm = ({ suggest }: { suggest: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);
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
      onSubmit={async (data) => {
        setIsLoading(true);
        if (suggest) {
          await createSuggestion({
            type: SuggestionType.Alignment,
            name: data.name,
            description: data.description,
          });
          toast.info("Votre suggestion a été envoyée");
          setIsLoading(false);
          return;
        }
        const values = await createAlignment({
          name: data.name,
          description: data.description,
        });

        if (values?.validationErrors || values?.serverError) {
          if (values?.validationErrors) {
            toast.error("Veuillez remplir tous les champs");
          }
          if (values?.serverError) {
            toast.error("Vous devez être connecté pour créer un alignement");
          }
          setIsLoading(false);
          return;
        }

        toast.success("Alignement créé avec succès", {
          action: {
            label: "Annuler",
            onClick: async () => {
              await deleteAlignment({
                name: data.name,
              });
              toast.success("Alignement supprimé avec succès");
            },
          },
        });
        setIsLoading(false);
      }}
    >
      <AutoFormSubmit isLoading={isLoading}>
        {suggest ? "Suggérer" : "Créer le alignement"}
      </AutoFormSubmit>
    </AutoForm>
  );
};
