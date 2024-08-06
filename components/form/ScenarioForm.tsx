"use client";

import { createScenario } from "@/src/actions/scenario.action";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../ui/auto-form";

const formScenarioSchema = z.object({
  name: z.string().max(50).describe("Nom du scénario"),
  universe: z.string().min(1).max(30).describe("Univers du scénario"),
  description: z
    .string()
    .max(200)
    .optional()
    .describe("Description du scénario"),
});

export const ScenarioForm = () => {
  const [isLoading, setIsLoading] = useState(false);
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
            toast.error("Veuillez remplir tous les champs");
          }
          if (values?.serverError) {
            toast.error("Vous devez être connecté pour créer un scénario");
          }
          setIsLoading(false);
          return;
        }

        toast.success("Scénario créé avec succès");
        setIsLoading(false);
      }}
      fieldConfig={{
        name: {
          inputProps: {
            placeholder: "Scenario super cool!",
          },
        },
        universe: {
          inputProps: {
            placeholder: "Univers ultra fun!",
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
      <AutoFormSubmit isLoading={isLoading}>Créer mon scénario</AutoFormSubmit>
    </AutoForm>
  );
};
