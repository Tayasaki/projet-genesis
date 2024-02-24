"use client";

import { createWeight } from "@/app/manage/createWeight.action";
import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { toast } from "sonner";
import { z } from "zod";

export const WeightForm = () => {
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
        const values = await createWeight({
          name: data.name,
        });
        if (values.validationErrors) {
          toast.error("Veuillez remplir tous les champs");
          return;
        }

        if (values.serverError) {
          toast.error("Vous devez être connecté pour créer un poids");
          return;
        }

        toast.success("Poids créé avec succès");
      }}
    >
      <AutoFormSubmit>Créer le poids</AutoFormSubmit>
    </AutoForm>
  );
};
