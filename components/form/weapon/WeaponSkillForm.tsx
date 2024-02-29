"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import {
  createWeaponSkill,
  deleteWeaponSkill,
} from "@/src/actions/weapon/weaponSkill.action";
import { toast } from "sonner";
import { z } from "zod";

export const WeaponSkillForm = () => {
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
        const values = await createWeaponSkill({
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
              await deleteWeaponSkill({
                name: data.name,
              });
              toast.success("Compétence supprimée avec succès");
            },
          },
        });
      }}
    >
      <AutoFormSubmit>Créer la compétence</AutoFormSubmit>
    </AutoForm>
  );
};
