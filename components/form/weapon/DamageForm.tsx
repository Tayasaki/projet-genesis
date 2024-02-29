"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { createDamage, deleteDamage } from "@/src/actions/weapon/damage.action";
import { toast } from "sonner";
import { z } from "zod";

export const DamageForm = () => {
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
        const values = await createDamage({
          name: data.name,
        });
        if (values.validationErrors) {
          toast.error("Veuillez remplir tous les champs");
          return;
        }

        if (values.serverError) {
          toast.error("Vous devez être connecté pour créer un dégât");
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
      }}
    >
      <AutoFormSubmit>Créer le dégât</AutoFormSubmit>
    </AutoForm>
  );
};
