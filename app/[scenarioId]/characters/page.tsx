import { Character } from "@/components/features/layout/Character";
import { ImportCharacter } from "@/components/features/layout/ImportCharacter";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCharacters } from "../../../src/query/character.query";
import { DisplayCharacter } from "@/components/features/layout/DisplayCharacter";

export default async function ScenarioManage(
  props: {
    params: Promise<{ scenarioId: string }>;
  }
) {
  const params = await props.params;
  const session = await getAuthSession();
  if (!session) redirect("/login");
  const scenario = await prisma.scenario.findUnique({
    where: {
      id: params.scenarioId,
    },
  });

  if (!scenario) notFound();
  const scenarioCharacter = await getCharacters(params.scenarioId);
  const userCharacter = (
    await prisma.character.findMany({
      where: {
        scenario: {
          some: {
            userId: session.user.id,
          },
        },
      },
    })
  ).filter((c) => !scenarioCharacter.some((sc) => sc.id === c.id));

  const characterToImport: string[] = [];

  scenarioCharacter.sort((a, b) => (a.pj === b.pj ? 0 : a.pj ? -1 : 1));

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="mb-8 text-3xl font-bold">
          {scenario.name} ({scenario.universe})
        </h1>
        <span className=" italic text-muted-foreground">
          {scenario.description}
        </span>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Personnages</h2>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger
              className={cn(buttonVariants(), "flex items-center gap-2")}
            >
              <Plus size={16} className="mr-2" />
              Importer
            </DialogTrigger>
            <DialogContent className=" max-w-5xl">
              <DialogHeader>
                <DialogTitle>Importer un personnage</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Sélectionnez un personnage dans votre liste pour l&apos;importer
                dans ce scénario.
              </DialogDescription>
              <ImportCharacter
                characterList={userCharacter}
                scenarioId={params.scenarioId}
              />
            </DialogContent>
          </Dialog>
          <Link
            className={cn(buttonVariants({ variant: "link" }), "group")}
            href={`/${params.scenarioId}/character-generation`}
          >
            Créer un personnage
            <ArrowRight
              className="ml-2 transition group-hover:translate-x-2"
              size={16}
            />
          </Link>
        </div>
      </div>
      {scenarioCharacter.length > 0 ? (
        <DisplayCharacter characterList={scenarioCharacter} />
      ) : (
        <p>Pas encore de personnage</p>
      )}
    </div>
  );
}
