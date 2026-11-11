import {
  createCharacterSkill,
  deleteCharacterSkill,
} from "@/src/actions/character/characterSkill.action";
import { SuggestionType } from "@prisma/client";
import { requiredString } from "@/components/form/required-string";
import { useTranslations } from "next-intl";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";
import { useAttributeSubmit } from "../attribute/use-attribute-submit";

export const CharacterSkillForm = ({ suggest }: { suggest: boolean }) => {
  const t = useTranslations("attributes.characterSkill");
  const tCommon = useTranslations("common");
  const { isLoading, handleSubmit } = useAttributeSubmit({
    suggest,
    suggestionType: SuggestionType.CharacterSkill,
    createAction: createCharacterSkill,
    deleteAction: deleteCharacterSkill,
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
