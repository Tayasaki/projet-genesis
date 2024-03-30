import {
  createStrength,
  deleteStrength,
} from "@/src/actions/character/strength.action";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";

export const StrengthForm = ({ suggest }: { suggest: boolean }) => {
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
        if (suggest) {
          toast.info("Votre suggestion a été envoyée");
          setIsLoading(false);
          return;
        }
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
