"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { createSuggestion } from "@/src/actions/suggestion.action";
import { createRange, deleteRange } from "@/src/actions/weapon/range.action";
import { SuggestionType } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const RangeForm = ({ suggest }: { suggest: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);
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
      onSubmit={async (data) => {
        setIsLoading(true);
        if (suggest) {
          await createSuggestion({
            type: SuggestionType.Range,
            name: data.name,
          });
          toast.info("Votre suggestion a été envoyée");
          setIsLoading(false);
          return;
        }
        const values = await createRange({
          name: data.name,
        });

        if (values?.validationErrors || values?.serverError) {
          if (values?.validationErrors) {
            toast.error("Veuillez remplir tous les champs");
          }
          if (values?.serverError) {
            toast.error("Vous devez être connecté pour créer une porté");
          }
          setIsLoading(false);
          return;
        }

        toast.success("Porté créé avec succès", {
          action: {
            label: "Annuler",
            onClick: async () => {
              await deleteRange({
                name: data.name,
              });
              toast.success("Porté supprimée avec succès");
            },
          },
        });
        setIsLoading(false);
      }}
    >
      <AutoFormSubmit isLoading={isLoading}>
        {suggest ? "Suggérer" : "Créer la porté"}
      </AutoFormSubmit>
    </AutoForm>
  );
};
