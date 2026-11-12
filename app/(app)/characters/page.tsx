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
import { MyCharactersTable } from "./characterColumns";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("myCharacters"), description: t("appDescription") };
}

const getUserCharacters = cache((userId: string) =>
  prisma.character.findMany({
    where: charactersOwnedBy(userId),
  }),
);

export default async function MyCharacters() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");
  const characters = await getUserCharacters(session.user.id);
  const t = await getTranslations("myCharacters");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("heading")}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-6">
            {t("description")}
          </p>
        </div>
        <Button asChild>
          <Link href="/characters/new">
            <Plus className="mr-2 size-4" />
            {t("createCharacter")}
          </Link>
        </Button>
      </div>
      {characters.length > 0 ? (
        <MyCharactersTable data={characters} />
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
