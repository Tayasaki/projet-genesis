import {
  createFortune,
  deleteFortune,
} from "@/src/actions/character/fortune.action";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";
import { createSuggestion } from "@/src/actions/suggestion.action";
import { SuggestionType } from "@prisma/client";

export const FortuneForm = ({ suggest }: { suggest: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);
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
      onSubmit={async (data) => {
        setIsLoading(true);
        if (suggest) {
          await createSuggestion({
            type: SuggestionType.Fortune,
            name: data.name,
            description: data.description,
          });
          toast.info("Votre suggestion a été envoyée");
          setIsLoading(false);
          return;
        }
        const values = await createFortune({
          name: data.name,
          description: data.description,
        });

        if (values?.validationErrors || values?.serverError) {
          if (values?.validationErrors) {
            toast.error("Veuillez remplir tous les champs");
          }
          if (values?.serverError) {
            toast.error("Vous devez être connecté pour créer une richesse");
          }
          setIsLoading(false);
          return;
        }

        toast.success("Richesse créé avec succès", {
          action: {
            label: "Annuler",
            onClick: async () => {
              await deleteFortune({
                name: data.name,
              });
              toast.success("Richesse supprimée avec succès");
            },
          },
        });
        setIsLoading(false);
      }}
    >
      <AutoFormSubmit isLoading={isLoading}>
        {suggest ? "Suggérer" : "Créer la fortune"}
      </AutoFormSubmit>
    </AutoForm>
  );
};
