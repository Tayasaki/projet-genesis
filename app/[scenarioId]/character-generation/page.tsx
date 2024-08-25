import { CharacterForm } from "@/components/form/character/CharacterForm";
import { getAuthSession } from "@/lib/auth";
import { env } from "@/lib/env";
import {
  getAlignments,
  getCharacterSkills,
  getFortunes,
  getStrengths,
  getTemperments,
  getWeaknesses,
} from "@/src/query/character.query";
import { getWeapons } from "@/src/query/weapon.query";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Projet Genesis - Générer votre personnage",
  description:
    "Création de scénarios pour jeux de rôle | Générateur de fiche de personnage",
};

export default async function CharacterGeneration({
  params,
}: {
  params: { scenarioId: string };
}) {
  const session = await getAuthSession();
  if (!session?.user.id) redirect("/login");

  const temperments = await getTemperments();
  const strengths = await getStrengths();
  const weaknesses = await getWeaknesses();
  const characterSkills = await getCharacterSkills();
  const alignments = await getAlignments();
  const fortunes = await getFortunes();
  const weapons = await getWeapons(session.user.id);
  const isAIAllowed =
    env.OPENAI_API_KEY !== undefined && env.OPENAI_API_KEY !== "";

  return (
    <div className="-mx-96 space-y-2">
      <h1 className="text-3xl font-semibold">Générer votre personnage</h1>
      <CharacterForm
        temperments={temperments}
        strengths={strengths}
        weaknesses={weaknesses}
        characterSkills={characterSkills}
        weapons={weapons}
        alignements={alignments}
        fortunes={fortunes}
        scenarioId={params.scenarioId}
        autoGeneration={isAIAllowed}
      />
    </div>
  );
}
