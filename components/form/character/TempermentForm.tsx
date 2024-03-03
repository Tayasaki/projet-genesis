"use client";
import {
  createTemperment,
  deleteTemperment,
} from "@/src/actions/weapon/character/temperment.action";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";

export const TempermentForm = () => {
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
      onSubmit={async (data) => {
        setIsLoading(true);
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
