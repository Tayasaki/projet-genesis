import {
  createCharacterSkill,
  deleteCharacterSkill,
} from "@/src/actions/weapon/character/characterSkill.action";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";

export const CharacterSkillForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <AutoForm
      formSchema={z.object({
        name: z.string().max(50).describe("Nom de la compétence"),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: "Agile",
          },
        },
      }}
      onSubmit={async (data) => {
        setIsLoading(true);
        const values = await createCharacterSkill({
          name: data.name,
        });

        if (values.validationErrors || values.serverError) {
          if (values.validationErrors) {
            toast.error("Veuillez remplir tous les champs");
          }
          if (values.serverError) {
            toast.error("Vous devez être connecté pour créer une compétence");
          }
          setIsLoading(false);
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
        setIsLoading(false);
      }}
    >
      <AutoFormSubmit isLoading={isLoading}>Créer la compétence</AutoFormSubmit>
    </AutoForm>
  );
};
