"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { DependencyType } from "@/components/ui/auto-form/types";
import { createWeapon } from "@/src/actions/weapon/weapon.action";
import {
  Ammos,
  Damages,
  Ranges,
  WeaponSkill,
  Weights,
} from "@/src/query/weapon.query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const WeaponForm = ({
  ammos,
  weights,
  ranges,
  damages,
  skills,
}: {
  ammos: Ammos;
  weights: Weights;
  ranges: Ranges;
  damages: Damages;
  skills: WeaponSkill;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const ammoNames = ammos.map((a) => a.name) as [string, ...string[]];
  const weightNames = weights.map((w) => w.name) as [string, ...string[]];
  const rangeNames = ranges.map((r) => r.name) as [string, ...string[]];
  const damageNames = damages.map((d) => d.name) as [string, ...string[]];
  const skillNames = skills.map((s) => s.name) as [string, ...string[]];

  const weaponFormSchema = z.object({
    name: z.string().max(50).describe("Nom de l'arme"),
    melee: z.boolean().describe("Arme de mélée").default(true).optional(),
    description: z
      .string()
      .max(200)
      .describe("Description de l'arme")
      .optional(),
    ammo: z.enum(ammoNames).describe("Munition de l'arme").optional(),
    weight: z.enum(weightNames).describe("Poids de l'arme"),
    range: z.enum(rangeNames).describe("Portée de l'arme"),
    damage: z.enum(damageNames).describe("Dégât de l'arme"),
    skillSet: z
      .array(
        z.object({
          name: z.enum(skillNames).describe("Compétence").optional(),
        }),
      )
      .describe("Compétences"),
  });
  return (
    <AutoForm
      formSchema={weaponFormSchema}
      onSubmit={async (data) => {
        setIsLoading(true);
        const dataToSend = {
          ...data,
          skillSet: data.skillSet?.map((s) => s.name),
        };
        const values = await createWeapon(dataToSend);

        if (values.validationErrors || values.serverError) {
          if (values.validationErrors) {
            toast.error("Veuillez remplir tous les champs");
          }
          if (values.serverError) {
            toast.error("Vous devez être connecté pour créer une arme");
          }
          setIsLoading(false);
          return;
        }
        setIsLoading(false);
        toast.success("Arme créé avec succès");
        //router.push(`/${scenarioId}`);
      }}
      fieldConfig={{
        melee: {
          fieldType: "switch",
        },
      }}
      dependencies={[
        {
          sourceField: "melee",
          targetField: "ammo",
          type: DependencyType.HIDES,
          when: (melee) => melee,
        },
      ]}
    >
      <AutoFormSubmit isLoading={isLoading}>Créer l&apos;arme</AutoFormSubmit>
    </AutoForm>
  );
};
