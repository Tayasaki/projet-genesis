import { ScenarioList } from "@/components/features/layout/ScenarioList";
import { ScenarioForm } from "@/components/form/ScenarioForm";
import { Code } from "@/components/ui/code";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Dices } from "lucide-react";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");
  const scenarios = await prisma.scenario.findMany({
    where: {
      userId: session.user.id,
    },
  });
  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-4xl font-semibold">Bienvenue sur Projet Genesis!</h1>
      <p className="text-justify text-sm">
        Ce site sert pour créer des scénarios et généré des personnages{" "}
        <Code>
          <Dices size={16} /> aléatoirement
        </Code>
        . Il vous permet de garder une trace des vos personnage et vos armes
        pour vos <Code>🧙‍♂️ JDR</Code>. Vous pouvez utiliser librement les{" "}
        <Code>attributs</Code> de personnage et d&apos;arme mais vous ne pouvez
        pas les créer si vous n&apos;êtes pas autorisé. Par contre vous pouvez
        tout de même en suggérer 😉.
      </p>
      <ScenarioList scenario={scenarios} />
      <ScenarioForm />
    </main>
  );
}
