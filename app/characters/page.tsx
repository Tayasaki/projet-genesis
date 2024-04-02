import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DataTable } from "../manage/data-table";
import { columns } from "./characterColumns";

export const metadata: Metadata = {
  title: "Projet Genesis - Mes personnages",
  description:
    "Création de scénarios pour jeux de rôle | Générateur de fiche de personnage",
};

export default async function MyCharacters() {
  const session = await getAuthSession();
  if (!session) redirect("/login");
  const characters = await prisma.character.findMany({
    where: {
      scenario: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });
  return (
    <DataTable
      classname="-mx-96"
      columns={columns}
      data={characters}
      title="Personnages"
    />
  );
}
