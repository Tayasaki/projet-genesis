import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  if (!session) redirect("/login");

  const character = await prisma.character.findUnique({
    where: {
      id: params.characterId,
      scneario: {
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
    },
  });

  if (!character) return notFound();

  return (
    <section>
      <h1 className="text-4xl font-bold">{character.name}</h1>
      <p>{character.pj ? "🧔" : "🤖"}</p>
      <p>{character.age} ans</p>
      <p>{character.image ?? "Pas d'image"}</p>
      <p>{character.origin}</p>
      <p>{character.role}</p>
      <p className="text-red-500">{character.injury}</p>
      <p>{character.extra}</p>
      <p>{character.temperment?.name}</p>
      <p>{character.alignment?.name}</p>
      <p>{character.fortune?.name}</p>
      <div>
        {character.skillSet.length > 0 && (
          <>
            <h3 className="text-2xl font-semibold">Compétences</h3>
            <ul>
              {character.skillSet.map((s) => (
                <li className="italic" key={s.id}>
                  {s.name}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div>
        {character.strength.length > 0 && (
          <>
            <h3 className="text-2xl font-semibold">Forces</h3>
            <ul>
              {character.strength.map((s) => (
                <li className="italic" key={s.id}>
                  {s.name}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div>
        {character.weakness.length > 0 && (
          <>
            <h3 className="text-2xl font-semibold">Faiblesses</h3>
            <ul>
              {character.weakness.map((w) => (
                <li className="italic" key={w.id}>
                  {w.name}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div>
        {character.weapon.length > 0 && (
          <>
            <h3>Armes</h3>
            <ul>
              {character.weapon.map((w) => (
                <li key={w.id}>{w.name}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
