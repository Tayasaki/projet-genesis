"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { createRange, deleteRange } from "@/src/actions/weapon/range.action";
import { toast } from "sonner";
import { z } from "zod";

export const RangeForm = () => {
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
        const values = await createRange({
          name: data.name,
        });
        if (values.validationErrors) {
          toast.error("Veuillez remplir tous les champs");
          return;
        }

        if (values.serverError) {
          toast.error("Vous devez être connecté pour créer une porté");
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
      }}
    >
      <AutoFormSubmit>Créer la porté</AutoFormSubmit>
    </AutoForm>
  );
};
