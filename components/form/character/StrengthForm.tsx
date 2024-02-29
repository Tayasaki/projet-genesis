import {
  createStrength,
  deleteStrength,
} from "@/src/actions/weapon/character/strength.action";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";

export const StrengthForm = () => {
  const formStrengthSchema = z.object({
    name: z.string().max(50).describe("Nom du la force"),
  });
  return (
    <AutoForm
      formSchema={formStrengthSchema}
      onSubmit={async (data) => {
        const values = await createStrength({
          name: data.name,
        });
        if (values.validationErrors) {
          toast.error("Veuillez remplir tous les champs");
          return;
        }

        if (values.serverError) {
          toast.error("Vous devez être connecté pour créer une force");
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
      }}
    >
      <AutoFormSubmit>Créer la force</AutoFormSubmit>
    </AutoForm>
  );
};
