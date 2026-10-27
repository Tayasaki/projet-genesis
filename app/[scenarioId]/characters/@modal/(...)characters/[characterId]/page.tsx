import { CharacterModal } from "@/components/features/layout/CharacterModal";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export default async function ModalCharacter(props: {
  params: Promise<{ characterId: string }>;
}) {
  const params = await props.params;
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");

  const character = await prisma.character.findUnique({
    where: {
      id: params.characterId,
      scenario: {
        some: {
          user: {
            id: session.user.id,
          },
        },
      },
    },
    include: {
      temperment: true,
      alignment: true,
      strength: true,
      weakness: true,
      fortune: true,
      skillSet: true,
      weapon: true,
    },
  });
  if (!character) notFound();
  return <CharacterModal character={character} />;
}
