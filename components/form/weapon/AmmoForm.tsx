"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { createAmmo, deleteAmmo } from "@/src/actions/weapon/ammo.action";
import { toast } from "sonner";
import { z } from "zod";

export const AmmoForm = () => {
  return (
    <AutoForm
      formSchema={z.object({
        name: z.string().max(50).describe("Nom de la munition"),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: "Peu de muntion",
          },
        },
      }}
      onSubmit={async (data) => {
        const values = await createAmmo({
          name: data.name,
        });
        if (values.validationErrors) {
          toast.error("Veuillez remplir tous les champs");
          return;
        }

        if (values.serverError) {
          toast.error("Vous devez être connecté pour créer une munition");
          return;
        }

        toast.success("Munition créé avec succès", {
          action: {
            label: "Annuler",
            onClick: async () => {
              await deleteAmmo({
                name: data.name,
              });
              toast.success("Munition supprimée avec succès");
            },
          },
        });
      }}
    >
      <AutoFormSubmit>Créer la munition</AutoFormSubmit>
    </AutoForm>
  );
};
