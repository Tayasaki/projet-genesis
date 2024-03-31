"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { createSuggestion } from "@/src/actions/suggestion.action";
import {
  createWeaponSkill,
  deleteWeaponSkill,
} from "@/src/actions/weapon/weaponSkill.action";
import { SuggestionType } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const WeaponSkillForm = ({ suggest }: { suggest: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);
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
      onSubmit={async (data) => {
        setIsLoading(true);
        if (suggest) {
          const values = await createSuggestion({
            type: SuggestionType.WeaponSkill,
            name: data.name,
          });
          toast.info("Votre suggestion a été envoyée");
          setIsLoading(false);
          return;
        }
        const values = await createWeaponSkill({
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
              await deleteWeaponSkill({
                name: data.name,
              });
              toast.success("Compétence supprimée avec succès");
            },
          },
        });
        setIsLoading(false);
      }}
    >
      <AutoFormSubmit isLoading={isLoading}>
        {suggest ? "Suggérer" : "Créer la compétence"}
      </AutoFormSubmit>
    </AutoForm>
  );
};
