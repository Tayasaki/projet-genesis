import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import React from "react";

type Props = {
  params: Promise<{ scenarioId: string }>;
  modal: React.ReactNode;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const scenario = await prisma.scenario.findUniqueOrThrow({
    where: { id: params.scenarioId },
    select: { name: true },
  });

  return {
    title: "Projet Genesis - " + scenario.name,
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
