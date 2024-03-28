import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { DataTable } from "../manage/data-table";
import { columns } from "./characterColumns";

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
