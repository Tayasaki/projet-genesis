import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAuthSession } from "@/lib/auth";
import { charactersOwnedBy } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { Plus, Users } from "lucide-react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cache } from "react";
import { MyCharactersGrid } from "./MyCharactersGrid";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("myCharacters"), description: t("appDescription") };
}

const getUserCharacters = cache((userId: string) =>
  prisma.character.findMany({
    where: charactersOwnedBy(userId),
    include: {
      temperment: true,
      alignment: true,
      strength: true,
      weakness: true,
      fortune: true,
      skillSet: true,
      weapon: true,
    },
  }),
);

export default async function MyCharacters() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");
  const characters = await getUserCharacters(session.user.id);
  const t = await getTranslations("myCharacters");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("heading")}
        description={t("description")}
        actions={
          <Button asChild>
            <Link href="/characters/new">
              <Plus className="mr-2 size-4" />
              {t("createCharacter")}
            </Link>
          </Button>
        }
      />
      {characters.length > 0 ? (
        <MyCharactersGrid characters={characters} />
      ) : (
        <EmptyState
          icon={Users}
          title={t("empty")}
          description={t("emptyDescription")}
        />
      )}
    </div>
  );
}
