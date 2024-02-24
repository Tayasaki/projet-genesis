"use client";
import { createAlignment } from "@/app/manage/createAlignment.action";
import { toast } from "sonner";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../../ui/auto-form";

export const AlignementForm = () => {
  const formAlignementSchema = z.object({
    name: z.string().max(50).describe("Nom de l'alignement"),
    description: z
      .string()
      .max(200)
      .optional()
      .describe("Description de l'alignement"),
  });
  return (
    <AutoForm
      formSchema={formAlignementSchema}
      onSubmit={async (data) => {
        const values = await createAlignment({
          name: data.name,
          description: data.description,
        });
        if (values.validationErrors) {
          toast.error("Veuillez remplir tous les champs");
          return;
        }

        if (values.serverError) {
          toast.error("Vous devez être connecté pour créer un alignement");
          return;
        }

        toast.success("Alignement créé avec succès");
      }}
    >
      <AutoFormSubmit>Créer le alignement</AutoFormSubmit>
    </AutoForm>
  );
};
