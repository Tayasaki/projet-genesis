import { prisma } from "@/lib/prisma";
import { Character } from "@/src/features/character/Character";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacters } from "../../src/features/query/character.query";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default async function ScenarioManage({
  params,
}: {
  params: { scenarioId: string };
}) {
  const scenario = await prisma.scenario.findUnique({
    where: {
      id: params.scenarioId,
    },
  });

  if (!scenario) notFound();
  const characters = await getCharacters(params.scenarioId);

  return (
    <div>
      <h1 className="text-3xl">
        {scenario.name} ({scenario.universe})
      </h1>
      <span>{scenario.description}</span>
      {characters.length > 0 ? (
        <div>
          <h2 className="text-xl">Characters</h2>
          <div className="grid grid-cols-4 gap-4">
            {characters.map((c) => (
              <Character key={c.id} character={c} />
            ))}
          </div>
        </div>
      ) : (
        <p>Pas encore de personnage</p>
      )}
      <Link
        className={cn("mt-4", buttonVariants({ variant: "default" }))}
        href={`/${params.scenarioId}/generation-personnage`}
      >
        Créer un personnage
      </Link>
    </div>
  );
}
