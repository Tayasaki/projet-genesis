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
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { requiredString } from "@/components/form/required-string";
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
  const t = useTranslations("weaponForm");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  const ammoNames = ammos.map((a) => a.name) as [string, ...string[]];
  const weightNames = weights.map((w) => w.name) as [string, ...string[]];
  const rangeNames = ranges.map((r) => r.name) as [string, ...string[]];
  const damageNames = damages.map((d) => d.name) as [string, ...string[]];
  const skillNames = skills.map((s) => s.name) as [string, ...string[]];

  const weaponFormSchema = z.object({
    name: requiredString(50, tCommon("requiredField")).describe(
      t("nameDescribe"),
    ),
    melee: z.boolean().describe(t("meleeDescribe")).default(true).optional(),
    description: z
      .string()
      .max(200)
      .describe(t("descriptionDescribe"))
      .optional(),
    ammo: z.enum(ammoNames).describe(t("ammoDescribe")).optional(),
    weight: z.enum(weightNames).describe(t("weightDescribe")),
    range: z.enum(rangeNames).describe(t("rangeDescribe")),
    damage: z.enum(damageNames).describe(t("damageDescribe")),
    skillSet: z
      .array(
        z.object({
          name: z.enum(skillNames).describe(t("skillDescribe")).optional(),
        }),
      )
      .describe(t("skillSetDescribe")),
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

        if (values?.validationErrors || values?.serverError) {
          if (values?.validationErrors) {
            toast.error(tCommon("requiredFieldsError"));
          }
          if (values?.serverError) {
            toast.error(t("authError"));
          }
          setIsLoading(false);
          return values;
        }
        setIsLoading(false);
        toast.success(t("createdSuccess"));
        return values;
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
      <AutoFormSubmit isLoading={isLoading}>{t("createSubmit")}</AutoFormSubmit>
    </AutoForm>
  );
};
