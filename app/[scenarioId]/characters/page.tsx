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
import { EmptyState } from "@/components/ui/empty-state";
import { getAuthSession } from "@/lib/auth";
import { charactersOwnedBy, scenarioOwnedBy } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { ArrowRight, Plus, Users } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCharacters } from "../../../src/query/character.query";
import { DisplayCharacter } from "@/components/features/layout/DisplayCharacter";

export default async function ScenarioManage(props: {
  params: Promise<{ scenarioId: string }>;
}) {
  const params = await props.params;
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");
  const scenario = await prisma.scenario.findUnique({
    where: scenarioOwnedBy(params.scenarioId, session.user.id),
  });

  if (!scenario) notFound();
  const scenarioCharacter = await getCharacters(params.scenarioId, session.user.id);
  const userCharacter = (
    await prisma.character.findMany({
      where: charactersOwnedBy(session.user.id),
    })
  ).filter((c) => !scenarioCharacter.some((sc) => sc.id === c.id));

  scenarioCharacter.sort((a, b) => (a.pj === b.pj ? 0 : a.pj ? -1 : 1));

  return (
    <div className="flex h-full flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          {scenario.name} ({scenario.universe})
        </h1>
        <span className="text-muted-foreground text-sm">
          {scenario.description}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Personnages</h2>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger
              className={cn(buttonVariants(), "flex items-center gap-2")}
            >
              <Plus size={16} className="mr-2" />
              Importer
            </DialogTrigger>
            <DialogContent className="max-w-5xl">
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
        <EmptyState
          icon={Users}
          title="Pas encore de personnage"
          description="Créez-en un ou importez-en un existant."
        />
      )}
    </div>
  );
}
