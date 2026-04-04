import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { cache } from "react";
import { DataTable } from "../manage/data-table";
import { columns } from "./characterColumns";

export const metadata: Metadata = {
  title: "Projet Genesis - Mes personnages",
  description:
    "Création de scénarios pour jeux de rôle | Générateur de fiche de personnage",
};

const getUserCharacters = cache((userId: string) =>
  prisma.character.findMany({
    where: { scenario: { some: { userId } } },
  }),
);

export default async function MyCharacters() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");
  const characters = await getUserCharacters(session.user.id);
  return (
    <DataTable
      classname="-mx-96"
      columns={columns}
      data={characters}
      title="Personnages"
    />
  );
}
