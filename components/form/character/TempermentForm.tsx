"use client";
import {
  createTemperment,
  deleteTemperment,
} from "@/src/actions/character/temperment.action";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";

export const TempermentForm = ({ suggest }: { suggest: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);
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
      onSubmit={async (data) => {
        setIsLoading(true);
        if (suggest) {
          toast.info("Votre suggestion a été envoyée");
          setIsLoading(false);
          return;
        }
        const values = await createTemperment({
          name: data.name,
          description: data.description,
        });

        if (values.validationErrors || values.serverError) {
          if (values.validationErrors) {
            toast.error("Veuillez remplir tous les champs");
          }
          if (values.serverError) {
            toast.error("Vous devez être connecté pour créer un tempérament");
          }
          setIsLoading(false);
          return;
        }

        toast.success("Tempérament créé avec succès", {
          action: {
            label: "Annuler",
            onClick: async () => {
              await deleteTemperment({
                name: data.name,
              });
              toast.success("Tempérament supprimé avec succès");
            },
          },
        });
        setIsLoading(false);
      }}
    >
      <AutoFormSubmit isLoading={isLoading}>
        Créer le tempérament
      </AutoFormSubmit>
    </AutoForm>
  );
};
