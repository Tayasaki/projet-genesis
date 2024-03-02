import { CharacterForm } from "@/components/form/character/CharacterForm";
import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import {
  getAlignments,
  getCharacterSkills,
  getFortunes,
  getStrengths,
  getTemperments,
  getWeaknesses,
} from "@/src/features/query/character.query";
import { z } from "zod";

export default async function CharacterGeneration({
  params,
}: {
  params: { scenarioId: string };
}) {
  const temperments = await getTemperments();
  const strengths = await getStrengths();
  const weaknesses = await getWeaknesses();
  const characterSkills = await getCharacterSkills();
  const alignments = await getAlignments();
  const fortunes = await getFortunes();

  return (
    <div className="">
      <h1>Générer votre personnage</h1>
      <CharacterForm
        temperments={temperments}
        strengths={strengths}
        weaknesses={weaknesses}
        characterSkills={characterSkills}
        alignements={alignments}
        fortunes={fortunes}
        scenarioId={params.scenarioId}
      />
    </div>
  );
}
