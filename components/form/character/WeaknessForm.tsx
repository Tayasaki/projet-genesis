import {
  createWeakness,
  deleteWeakness,
} from "@/src/actions/weapon/character/weakness.action";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";

export const WeaknessForm = () => {
  const formWeaknessSchema = z.object({
    name: z.string().max(50).describe("Nom de la faiblesse"),
  });
  return (
    <AutoForm
      formSchema={formWeaknessSchema}
      onSubmit={async (data) => {
        const values = await createWeakness({
          name: data.name,
        });
        if (values.validationErrors) {
          toast.error("Veuillez remplir tous les champs");
          return;
        }

        if (values.serverError) {
          toast.error("Vous devez être connecté pour créer une faiblesse");
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
      }}
    >
      <AutoFormSubmit>Créer la faiblesse</AutoFormSubmit>
    </AutoForm>
  );
};
