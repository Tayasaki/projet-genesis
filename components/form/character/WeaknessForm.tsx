import {
  createWeakness,
  deleteWeakness,
} from "@/src/actions/weapon/character/weakness.action";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";

export const WeaknessForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <AutoForm
      formSchema={z.object({
        name: z.string().max(50).describe("Nom de la faiblesse"),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: "Faible comme un chaton",
          },
        },
      }}
      onSubmit={async (data) => {
        setIsLoading(true);
        const values = await createWeakness({
          name: data.name,
        });

        if (values.validationErrors || values.serverError) {
          if (values.validationErrors) {
            toast.error("Veuillez remplir tous les champs");
          }
          if (values.serverError) {
            toast.error("Vous devez être connecté pour créer une faiblesse");
          }
          setIsLoading(false);
          return;
        }

        toast.success("Faiblesse créé avec succès", {
          action: {
            label: "Annuler",
            onClick: async () => {
              await deleteWeakness({
                name: data.name,
              });
              toast.success("Faiblesse supprimée avec succès");
            },
          },
        });
        setIsLoading(false);
      }}
    >
      <AutoFormSubmit isLoading={isLoading}>Créer la faiblesse</AutoFormSubmit>
    </AutoForm>
  );
};
