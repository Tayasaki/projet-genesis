import { CharacterModal } from "@/components/features/layout/CharacterModal";
import { prisma } from "@/lib/prisma";

export default async function ModalCharacter({
  params,
}: {
  params: { characterId: string };
}) {
  const character = await prisma.character.findUniqueOrThrow({
    where: { id: params.characterId },
    include: {
      temperment: true,
      alignment: true,
      strength: true,
      weakness: true,
      fortune: true,
      skillSet: true,
    },
  });
  return <CharacterModal character={character} />;
}
