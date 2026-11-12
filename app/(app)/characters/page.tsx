import { getAuthSession } from "@/lib/auth";
import { charactersOwnedBy } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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
  return <MyCharactersTable data={characters} />;
}
