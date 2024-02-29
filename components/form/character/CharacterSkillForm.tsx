import {
  createCharacterSkill,
  deleteCharacterSkill,
} from "@/src/actions/weapon/character/characterSkill.action";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";

export const CharacterSkillForm = () => {
  const formCharacterSkillSchema = z.object({
    name: z.string().max(50).describe("Nom de la compétence"),
  });
  return (
    <AutoForm
      formSchema={formCharacterSkillSchema}
      onSubmit={async (data) => {
        const values = await createCharacterSkill({
          name: data.name,
        });
        if (values.validationErrors) {
          toast.error("Veuillez remplir tous les champs");
          return;
        }

        if (values.serverError) {
          toast.error("Vous devez être connecté pour créer une compétence");
          return;
        }

        toast.success("Compétence créé avec succès", {
          action: {
            label: "Annuler",
            onClick: async () => {
              await deleteCharacterSkill({
                name: data.name,
              });
              toast.success("Compétence supprimé avec succès");
            },
          },
        });
      }}
    >
      <AutoFormSubmit>Créer la compétence</AutoFormSubmit>
    </AutoForm>
  );
};
