"use client";
import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { createCharacter } from "@/src/actions/weapon/character/character.action";
import {
  Alignments,
  CharacterSkills,
  Fortunes,
  Strengths,
  Temperments,
  Weaknesses,
} from "@/src/features/query/character.query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

export const CharacterForm = ({
  temperments,
  strengths,
  weaknesses,
  characterSkills,
  alignements,
  fortunes,
  scenarioId,
}: {
  temperments: Temperments;
  strengths: Strengths;
  weaknesses: Weaknesses;
  characterSkills: CharacterSkills;
  alignements: Alignments;
  fortunes: Fortunes;
  scenarioId: string;
}) => {
  const router = useRouter();

  const tempermentsNames: String[] = temperments.map((t) => t.name);
  const alignementsNames: String[] = alignements.map((a) => a.name);
  const fortunesNames: String[] = fortunes.map((f) => f.name);
  const strengthNames: String[] = strengths.map((s) => s.name);
  const weaknessNames: String[] = weaknesses.map((w) => w.name);
  const characterSkillNames: String[] = characterSkills.map((c) => c.name);

  const characterFormSchema = z.object({
    name: z.string().max(50).describe("Nom du personnage"),
    pj: z.boolean().describe("Personnage joueur").default(true).optional(),
    origin: z.string().max(100).describe("Origine du personnage").optional(),
    role: z.string().max(50).describe("Rôle du personnage").optional(),
    age: z.number().min(1).describe("Age du personnage").optional(),
    injury: z.string().max(100).describe("Blessure").optional(),
    extra: z.string().max(200).describe("Extra").optional(),
    temperment: z.enum([...tempermentsNames]).describe("Tempérament"),
    alignment: z.enum([...alignementsNames]).describe("Alignement"),
    fortune: z.enum([...fortunesNames]).describe("Richesse"),
    strength: z
      .array(z.object({ name: z.enum([...strengthNames]).describe("Force") }))
      .describe("Force"),
    weakness: z
      .array(
        z.object({ name: z.enum([...weaknessNames]).describe("Faiblesse") }),
      )
      .describe("Faiblesse"),
    skillSet: z
      .array(
        z.object({
          name: z.enum([...characterSkillNames]).describe("Compétence"),
        }),
      )
      .describe("Compétences"),
  });

  return (
    <AutoForm
      onSubmit={async (data) => {
        const dataToSend = {
          ...data,
          strength: data.strength.map((s) => s.name),
          weakness: data.weakness.map((w) => w.name),
          skillSet: data.skillSet.map((s) => s.name),
          scenarioId: scenarioId,
        };
        const values = await createCharacter(dataToSend);

        if (values.validationErrors) {
          toast.error("Veuillez remplir tous les champs");
          return;
        }

        if (values.serverError) {
          toast.error("Vous devez être connecté pour créer un alignement");
          return;
        }

        toast.success("Personnage créé avec succès");
        router.push(`/${scenarioId}`);
      }}
      formSchema={characterFormSchema}
      className="flex w-96 flex-col rounded-lg p-4 shadow-md dark:border dark:bg-card"
      fieldConfig={{
        pj: {
          fieldType: "switch",
        },
      }}
    >
      <AutoFormSubmit>Créer votre personnage</AutoFormSubmit>
    </AutoForm>
  );
};