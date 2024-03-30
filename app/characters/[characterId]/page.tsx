import { CharacterForm } from "@/components/form/character/CharacterForm";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
import { notFound, redirect } from "next/navigation";

type Props = {
  params: { characterId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const character = await prisma.character.findUniqueOrThrow({
    where: { id: params.characterId },
    select: { name: true },
  });

  return {
    title: "Projet Genesis - " + character.name,
    description:
      "Création de scénarios pour jeux de rôle | Générateur de fiche de personnage",
  };
}

export default async function CharacterPage({
  params,
}: {
  params: { characterId: string; scenarioId: string };
}) {
  const session = await getAuthSession();

  if (!session?.user.id) redirect("/login");

  const character = await prisma.character.findUnique({
    where: {
      id: params.characterId,
      scenario: {
        some: {
          user: {
            id: session?.user.id,
          },
        },
      },
    },
    include: {
      temperment: true,
      alignment: true,
      fortune: true,
      skillSet: true,
      strength: true,
      weakness: true,
      weapon: true,
      scenario: { select: { id: true } },
    },
  });

  if (!character) return notFound();

  const temperments = await getTemperments();
  const alignments = await getAlignments();
  const fortunes = await getFortunes();
  const strengths = await getStrengths();
  const weaknesses = await getWeaknesses();
  const weapons = await getWeapons(session.user.id);
  const characterSkills = await getCharacterSkills();

  return (
    <div className="-mx-96 space-y-2">
      <h1 className="text-3xl font-semibold">Modifier votre personnage</h1>
      <CharacterForm
        temperments={temperments}
        alignements={alignments}
        fortunes={fortunes}
        strengths={strengths}
        weaknesses={weaknesses}
        weapons={weapons}
        characterSkills={characterSkills}
        character={character}
        modify
      />
    </div>
  );
}
