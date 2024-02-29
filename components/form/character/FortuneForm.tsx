import {
  createFortune,
  deleteFortune,
} from "@/src/actions/weapon/character/fortune.action";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";

export const FortuneForm = () => {
  const formFortuneSchema = z.object({
    name: z.string().max(50).describe("Nom de la richesse"),
    description: z
      .string()
      .max(200)
      .optional()
      .describe("Description de la richesse"),
  });
  return (
    <AutoForm
      formSchema={formFortuneSchema}
      onSubmit={async (data) => {
        const values = await createFortune({
          name: data.name,
          description: data.description,
        });
        if (values.validationErrors) {
          toast.error("Veuillez remplir tous les champs");
          return;
        }

        if (values.serverError) {
          toast.error("Vous devez être connecté pour créer une richesse");
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
      }}
    >
      <AutoFormSubmit>Créer la fortune</AutoFormSubmit>
    </AutoForm>
  );
};
