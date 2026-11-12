import {
  createFortune,
  deleteFortune,
} from "@/src/actions/character/fortune.action";
import { SuggestionType } from "@prisma/client";
import { requiredString } from "@/components/form/required-string";
import { useTranslations } from "next-intl";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";
import { useAttributeSubmit } from "../attribute/use-attribute-submit";

export const FortuneForm = ({ suggest }: { suggest: boolean }) => {
  const t = useTranslations("attributes.fortune");
  const tCommon = useTranslations("common");
  const { isLoading, handleSubmit } = useAttributeSubmit({
    suggest,
    suggestionType: SuggestionType.Fortune,
    createAction: createFortune,
    deleteAction: deleteFortune,
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
        description: z
          .string()
          .max(200)
          .optional()
          .describe(t("descriptionDescribe")),
      })}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: t("namePlaceholder"),
          },
        },
        description: {
          inputProps: {
            placeholder: t("descriptionPlaceholder"),
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
