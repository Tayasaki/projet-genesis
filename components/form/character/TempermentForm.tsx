"use client";
import { createTemperment } from "@/app/manage/createTemperment.action";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";

export const TempermentForm = () => {
  const formTempermentSchema = z.object({
    name: z.string().max(50).describe("Nom du tempérament"),
    description: z
      .string()
      .max(200)
      .optional()
      .describe("Description du tempérament"),
  });
  return (
    <AutoForm
      formSchema={formTempermentSchema}
      onSubmit={async (data) => {
        const values = await createTemperment({
          name: data.name,
          description: data.description,
        });
        if (values.validationErrors) {
          toast.error("Veuillez remplir tous les champs");
          return;
        }

        if (values.serverError) {
          toast.error("Vous devez être connecté pour créer un tempérament");
          return;
        }

        toast.success("Tempérament créé avec succès");
      }}
    >
      <AutoFormSubmit>Créer le tempérament</AutoFormSubmit>
    </AutoForm>
  );
};
