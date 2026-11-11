"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { createRange, deleteRange } from "@/src/actions/weapon/range.action";
import { SuggestionType } from "@prisma/client";
import { requiredString } from "@/components/form/required-string";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useAttributeSubmit } from "../attribute/use-attribute-submit";

export const RangeForm = ({ suggest }: { suggest: boolean }) => {
  const t = useTranslations("attributes.range");
  const tCommon = useTranslations("common");
  const { isLoading, handleSubmit } = useAttributeSubmit({
    suggest,
    suggestionType: SuggestionType.Range,
    createAction: createRange,
    deleteAction: deleteRange,
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
