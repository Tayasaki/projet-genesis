"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import {
  createWeaponSkill,
  deleteWeaponSkill,
} from "@/src/actions/weapon/weaponSkill.action";
import { SuggestionType } from "@prisma/client";
import { z } from "zod";
import { useAttributeSubmit } from "../attribute/use-attribute-submit";

export const WeaponSkillForm = ({ suggest }: { suggest: boolean }) => {
  const { isLoading, handleSubmit } = useAttributeSubmit({
    suggest,
    suggestionType: SuggestionType.WeaponSkill,
    createAction: createWeaponSkill,
    deleteAction: deleteWeaponSkill,
    labels: {
      authError: "Vous devez être connecté pour créer une compétence",
      created: "Compétence créé avec succès",
      deleted: "Compétence supprimée avec succès",
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
            placeholder: "Perçant",
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
