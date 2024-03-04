import {
  createStrength,
  deleteStrength,
} from "@/src/actions/weapon/character/strength.action";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";
import { useState } from "react";

export const StrengthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <AutoForm
      formSchema={z.object({
        name: z.string().max(50).describe("Nom du la force"),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: "Force de l'ours",
          },
        },
      }}
      onSubmit={async (data) => {
        setIsLoading(true);
        const values = await createStrength({
          name: data.name,
        });

        if (values.validationErrors || values.serverError) {
          if (values.validationErrors) {
            toast.error("Veuillez remplir tous les champs");
          }
          if (values.serverError) {
            toast.error("Vous devez être connecté pour créer une force");
          }
          setIsLoading(false);
          return;
        }

        toast.success("Force créé avec succès", {
          action: {
            label: "Annuler",
            onClick: async () => {
              await deleteStrength({
                name: data.name,
              });
              toast.success("Force supprimé avec succès");
            },
          },
        });
        setIsLoading(false);
      }}
    >
      <AutoFormSubmit isLoading={isLoading}>Créer la force</AutoFormSubmit>
    </AutoForm>
  );
};
