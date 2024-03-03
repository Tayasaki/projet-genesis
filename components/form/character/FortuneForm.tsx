import {
  createFortune,
  deleteFortune,
} from "@/src/actions/weapon/character/fortune.action";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";
import { useState } from "react";

export const FortuneForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <AutoForm
      formSchema={z.object({
        name: z.string().max(50).describe("Nom de la richesse"),
        description: z
          .string()
          .max(200)
          .optional()
          .describe("Description de la richesse"),
      })}
      onSubmit={async (data) => {
        setIsLoading(true);
        const values = await createFortune({
          name: data.name,
          description: data.description,
        });

        if (values.validationErrors || values.serverError) {
          if (values.validationErrors) {
            toast.error("Veuillez remplir tous les champs");
          }
          if (values.serverError) {
            toast.error("Vous devez être connecté pour créer une richesse");
          }
          setIsLoading(false);
          return;
        }

        toast.success("Richesse créé avec succès", {
          action: {
            label: "Annuler",
            onClick: async () => {
              await deleteFortune({
                name: data.name,
              });
              toast.success("Richesse supprimée avec succès");
            },
          },
        });
        setIsLoading(false);
      }}
    >
      <AutoFormSubmit isLoading={isLoading}>Créer la fortune</AutoFormSubmit>
    </AutoForm>
  );
};
