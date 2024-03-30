"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { createAmmo, deleteAmmo } from "@/src/actions/weapon/ammo.action";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const AmmoForm = ({ suggest }: { suggest: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);
        if (suggest) {
          toast.info("Votre suggestion a été envoyée");
          setIsLoading(false);
          return;
        }
        const values = await createAmmo({
          name: data.name,
        });

        if (values.validationErrors || values.serverError) {
          if (values.validationErrors) {
            toast.error("Veuillez remplir tous les champs");
          }
          if (values.serverError) {
            toast.error("Vous devez être connecté pour créer une munition");
          }
          setIsLoading(false);
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
        setIsLoading(false);
      }}
    >
      <AutoFormSubmit isLoading={isLoading}>Créer la munition</AutoFormSubmit>
    </AutoForm>
  );
};
