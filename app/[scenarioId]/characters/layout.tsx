import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import React from "react";

type Props = {
  params: Promise<{ scenarioId: string }>;
  modal: React.ReactNode;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const session = await getAuthSession();
  const scenario = session?.user?.id
    ? await prisma.scenario.findUnique({
        where: { id: params.scenarioId, userId: session.user.id },
        select: { name: true },
      })
    : null;

  return {
    title: scenario ? "Projet Genesis - " + scenario.name : "Projet Genesis",
    description:
      "Création de scénarios pour jeux de rôle | Générateur de fiche de personnage",
  };
}

export default function CharacterLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <section className="h-full">
      {children}
      {modal}
    </section>
  );
}
