import {
  createCharacterSkill,
  deleteCharacterSkill,
} from "@/src/actions/character/characterSkill.action";
import { SuggestionType } from "@prisma/client";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";
import { useAttributeSubmit } from "../attribute/use-attribute-submit";

export const CharacterSkillForm = ({ suggest }: { suggest: boolean }) => {
  const { isLoading, handleSubmit } = useAttributeSubmit({
    suggest,
    suggestionType: SuggestionType.CharacterSkill,
    createAction: createCharacterSkill,
    deleteAction: deleteCharacterSkill,
    labels: {
      authError: "Vous devez être connecté pour créer une compétence",
      created: "Compétence créé avec succès",
      deleted: "Compétence supprimé avec succès",
    },
  });
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
      onSubmit={handleSubmit}
    >
      <AutoFormSubmit isLoading={isLoading}>
        {suggest ? "Suggérer" : "Créer la compétence"}
      </AutoFormSubmit>
    </AutoForm>
  );
};
