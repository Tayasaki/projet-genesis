import { CharacterForm } from "@/components/form/character/CharacterForm";
import { getAuthSession } from "@/lib/auth";
import {
  getAlignments,
  getCharacterSkills,
  getFortunes,
  getStrengths,
  getTemperments,
  getWeaknesses,
} from "@/src/query/character.query";
import { getWeapons } from "@/src/query/weapon.query";
import { redirect } from "next/navigation";

export default async function CharacterGeneration({
  params,
}: {
  params: { scenarioId: string };
}) {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const temperments = await getTemperments();
  const strengths = await getStrengths();
  const weaknesses = await getWeaknesses();
  const characterSkills = await getCharacterSkills();
  const alignments = await getAlignments();
  const fortunes = await getFortunes();
  const weapons = await getWeapons();

  return (
    <div className="w-full">
      <h1>Générer votre personnage</h1>
      <CharacterForm
        temperments={temperments}
        strengths={strengths}
        weaknesses={weaknesses}
        characterSkills={characterSkills}
        weapons={weapons}
        alignements={alignments}
        fortunes={fortunes}
        scenarioId={params.scenarioId}
      />
    </div>
  );
}
