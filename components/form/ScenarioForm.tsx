"use client";

import { createScenario } from "@/src/actions/scenario.action";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { requiredString } from "@/components/form/required-string";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../ui/auto-form";

export const ScenarioForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const t = useTranslations("home");
  const [isLoading, setIsLoading] = useState(false);

  const formScenarioSchema = z.object({
    name: requiredString(50).describe(t("scenarioName")),
    universe: requiredString(30).describe(t("scenarioUniverse")),
    description: z.string().max(200).optional().describe(t("scenarioDescription")),
  });

  return (
    <AutoForm
      formSchema={formScenarioSchema}
      onSubmit={async (data) => {
        setIsLoading(true);
        const values = await createScenario({
          ...data,
        });

        if (values?.validationErrors || values?.serverError) {
          if (values?.validationErrors) {
            toast.error(t("requiredFieldsError"));
          }
          if (values?.serverError) {
            toast.error(t("mustBeLoggedInError"));
          }
          setIsLoading(false);
          return values;
        }

        toast.success(t("createdSuccess"));
        setIsLoading(false);
        onSuccess?.();
        return values;
      }}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: t("scenarioNamePlaceholder"),
          },
        },
        universe: {
          inputProps: {
            placeholder: t("scenarioUniversePlaceholder"),
          },
        },
        description: {
          inputProps: {
            placeholder:
              "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Alias culpa vel quam doloremque, soluta iste quis reiciendis? Quisquam, eum, dolores fuga iste est, aspernatur odit id magnam delectus dicta vel!",
          },
          fieldType: "textarea",
        },
      }}
    >
      <AutoFormSubmit isLoading={isLoading}>{t("submit")}</AutoFormSubmit>
    </AutoForm>
  );
};
