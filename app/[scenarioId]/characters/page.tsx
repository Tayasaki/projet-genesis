import { Character } from "@/components/features/layout/Character";
import { buttonVariants } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCharacters } from "../../../src/query/character.query";
import { cn } from "@/lib/utils";

export default async function ScenarioManage({
  params,
}: {
  params: { scenarioId: string };
}) {
  const session = await getAuthSession();
  if (!session) redirect("/login");
  const scenario = await prisma.scenario.findUnique({
    where: {
      id: params.scenarioId,
    },
  });

  if (!scenario) notFound();
  const characters = await getCharacters(params.scenarioId);

  characters.sort((a, b) => (a.pj === b.pj ? 0 : a.pj ? -1 : 1));

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
      {characters.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {characters.map((c) => (
              <div key={c.id}>
                <Character character={c} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Pas encore de personnage</p>
      )}
    </div>
  );
}
