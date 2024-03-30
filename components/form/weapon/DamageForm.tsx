"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { createDamage, deleteDamage } from "@/src/actions/weapon/damage.action";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const DamageForm = ({ suggest }: { suggest: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <AutoForm
      formSchema={z.object({
        name: z.string().max(50).describe("Nom du dégât"),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: "Peu de dégât",
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
        const values = await createDamage({
          name: data.name,
        });

        if (values.validationErrors || values.serverError) {
          if (values.validationErrors) {
            toast.error("Veuillez remplir tous les champs");
          }
          if (values.serverError) {
            toast.error("Vous devez être connecté pour créer un dégât");
          }
          setIsLoading(false);
          return;
        }

        toast.success("Dégât créé avec succès", {
          action: {
            label: "Annuler",
            onClick: async () => {
              await deleteDamage({
                name: data.name,
              });
              toast.success("Dégât supprimé avec succès");
            },
          },
        });
        setIsLoading(false);
      }}
    >
      <AutoFormSubmit isLoading={isLoading}>Créer le dégât</AutoFormSubmit>
    </AutoForm>
  );
};
