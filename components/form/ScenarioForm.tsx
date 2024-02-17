"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../ui/auto-form";

const formSchema = z.object({
  name: z.string().max(50).describe("Nom du scénario"),
  universe: z.string().min(1).max(30).describe("Univers du scénario"),
  description: z
    .string()
    .max(200)
    .optional()
    .describe("Description du scénario"),
});

export const ScenarioForm = ({ userId }: { userId: string | undefined }) => {
  const router = useRouter();
  async function createScenario(data: z.infer<typeof formSchema>) {
    try {
      await fetch("/api/scenario", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Votre scénario a bien été créé 🎉🎉");
      router.refresh();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la création du scénario");
    }
  }

  return (
    <AutoForm
      formSchema={formSchema}
      className="flex flex-col p-4 bg-white rounded-lg shadow-md w-96"
      onSubmit={createScenario}
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
      <AutoFormSubmit isLoggedIn={userId !== undefined}>
        Créer mon scénario
      </AutoFormSubmit>
    </AutoForm>
  );
};
