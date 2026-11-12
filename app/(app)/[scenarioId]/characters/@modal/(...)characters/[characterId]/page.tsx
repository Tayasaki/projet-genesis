import { CharacterModal } from "@/components/features/layout/CharacterModal";
import { getAuthSession } from "@/lib/auth";
import { getCharacterDetails } from "@/src/query/character.query";
import { notFound, redirect } from "next/navigation";

export default async function ModalCharacter(props: {
  params: Promise<{ characterId: string }>;
}) {
  const params = await props.params;
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");

  const character = await getCharacterDetails(
    params.characterId,
    session.user.id,
  );
  if (!character) notFound();
  return <CharacterModal character={character} />;
}
