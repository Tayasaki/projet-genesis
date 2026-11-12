import { CharacterDetails } from "@/components/features/layout/CharacterDetails";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { getAuthSession } from "@/lib/auth";
import { characterOwnedBy } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { getCharacterDetails } from "@/src/query/character.query";
import { PenLine } from "lucide-react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ characterId: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const session = await getAuthSession();
  const character = session?.user?.id
    ? await prisma.character.findUnique({
        where: characterOwnedBy(params.characterId, session.user.id),
        select: { name: true },
      })
    : null;

  return {
    title: character ? "Projet Genesis - " + character.name : "Projet Genesis",
    description:
      "Création de scénarios pour jeux de rôle | Générateur de fiche de personnage",
  };
}

export default async function CharacterPage(props: Props) {
  const params = await props.params;
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");

  const character = await getCharacterDetails(
    params.characterId,
    session.user.id,
  );
  if (!character) notFound();
  const t = await getTranslations("characterCard");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <PageHeader
        title={character.name}
        actions={
          <Button asChild variant="outline">
            <Link href={`/characters/${character.id}/edit`}>
              <PenLine />
              {t("edit")}
            </Link>
          </Button>
        }
      />
      <CharacterDetails character={character} titleAs="h2" />
    </div>
  );
}
