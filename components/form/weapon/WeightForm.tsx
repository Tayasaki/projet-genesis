"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { createWeight, deleteWeight } from "@/src/actions/weapon/weight.action";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const WeightForm = ({ suggest }: { suggest: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <AutoForm
      formSchema={z.object({
        name: z.string().max(50).describe("Nom du poids"),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: "Très lourd",
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
        const values = await createWeight({
          name: data.name,
        });

        if (values.validationErrors || values.serverError) {
          if (values.validationErrors) {
            toast.error("Veuillez remplir tous les champs");
          }
          if (values.serverError) {
            toast.error("Vous devez être connecté pour créer un poids");
          }
          setIsLoading(false);
          return;
        }

        toast.success("Poids créé avec succès", {
          action: {
            label: "Annuler",
            onClick: async () => {
              await deleteWeight({
                name: data.name,
              });
              toast.success("Poids supprimé avec succès");
            },
          },
        });
        setIsLoading(false);
      }}
    >
      <AutoFormSubmit isLoading={isLoading}>Créer le poids</AutoFormSubmit>
    </AutoForm>
  );
};
