import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Projet Genesis - Personnages",
  description:
    "Création de scénarios pour jeux de rôle | Générateur de fiche de personnage",
};

export default async function MyCharacters() {
  const session = await getAuthSession();
  if (!session) notFound();
  const characters = await prisma.character.findMany({
    where: {
      scneario: {
        every: {
          userId: session.user.id,
        },
      },
    },
  });
  return (
    <>
      <ul>
        {characters.map((character) => {
          return <li key={character.id}>{character.name}</li>;
        })}
      </ul>
    </>
  );
}
