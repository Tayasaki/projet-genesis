"use client";

import { createWeaponSkill } from "@/app/manage/createWeaponSkill.action";
import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
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

        toast.success("Compétence créé avec succès");
      }}
    >
      <AutoFormSubmit>Créer la compétence</AutoFormSubmit>
    </AutoForm>
  );
};
