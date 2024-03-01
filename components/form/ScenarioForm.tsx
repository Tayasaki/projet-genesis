"use client";

import { createScenario } from "@/app/createScenario.action";
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
  return (
    <AutoForm
      formSchema={formScenarioSchema}
      className="flex w-96 flex-col rounded-lg bg-white p-4 shadow-md dark:border dark:bg-card"
      onSubmit={async (data) => {
        const values = await createScenario({
          ...data,
        });

        if (values.validationErrors) {
          toast.error("Veuillez remplir tous les champs");
          return;
        }

        if (values.serverError) {
          toast.error("Vous devez être connecté pour créer un scénario");
          return;
        }

        toast.success("Scénario créé avec succès");
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
            placeholder: "blablabla...",
          },
        },
      }}
    >
      <AutoFormSubmit>Créer mon scénario</AutoFormSubmit>
    </AutoForm>
  );
};
