import { createWeakness } from "@/app/manage/createWeakness.action";
import { deleteWeakness } from "@/app/manage/deleteWeakness.action";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../ui/auto-form";

export const WeaknessForm = ({ userId }: { userId: string }) => {
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
              const values = await deleteWeakness({
                name: data.name,
              });
              toast.success("Faiblesse supprimé avec succès");
            },
          },
        });
      }}
    >
      <AutoFormSubmit isLoggedIn={userId ? true : false}>
        Créer la faiblesse
      </AutoFormSubmit>
    </AutoForm>
  );
};
