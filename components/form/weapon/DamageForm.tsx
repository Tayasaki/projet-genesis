"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { createDamage, deleteDamage } from "@/src/actions/weapon/damage.action";
import { SuggestionType } from "@prisma/client";
import { requiredString } from "@/components/form/required-string";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useAttributeSubmit } from "../attribute/use-attribute-submit";

export const DamageForm = ({ suggest }: { suggest: boolean }) => {
  const t = useTranslations("attributes.damage");
  const tCommon = useTranslations("common");
  const { isLoading, handleSubmit } = useAttributeSubmit({
    suggest,
    suggestionType: SuggestionType.Damage,
    createAction: createDamage,
    deleteAction: deleteDamage,
    labels: {
      authError: t("authError"),
      created: t("created"),
      deleted: t("deleted"),
    },
  });
  return (
    <AutoForm
      formSchema={z.object({
        name: requiredString(50, tCommon("requiredField")).describe(
          t("nameDescribe"),
        ),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: t("namePlaceholder"),
          },
        },
      }}
      onSubmit={handleSubmit}
    >
      <AutoFormSubmit isLoading={isLoading}>
        {suggest ? tCommon("suggest") : t("createSubmit")}
      </AutoFormSubmit>
    </AutoForm>
  );
};
