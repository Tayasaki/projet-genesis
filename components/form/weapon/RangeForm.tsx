"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { createRange, deleteRange } from "@/src/actions/weapon/range.action";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const RangeForm = () => {
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
        const values = await createRange({
          name: data.name,
        });

        if (values.validationErrors || values.serverError) {
          if (values.validationErrors) {
            toast.error("Veuillez remplir tous les champs");
          }
          if (values.serverError) {
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
      <AutoFormSubmit isLoading={isLoading}>Créer la porté</AutoFormSubmit>
    </AutoForm>
  );
};
