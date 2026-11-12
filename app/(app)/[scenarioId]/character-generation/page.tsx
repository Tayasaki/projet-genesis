import { PageHeader } from "@/components/ui/page-header";
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
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("characterGeneration"), description: t("appDescription") };
}

export default async function CharacterGeneration(props: {
  params: Promise<{ scenarioId: string }>;
}) {
  const params = await props.params;
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");
  const t = await getTranslations("characterForm");

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
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("generationPageTitle")}
        description={t("generationPageDescription")}
      />
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
