import { ScenarioList } from "@/components/features/layout/ScenarioList";
import { ScenarioForm } from "@/components/form/ScenarioForm";
import { FormPanel } from "@/components/ui/form-panel";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cache } from "react";

const getScenarios = cache((userId: string) =>
  prisma.scenario.findMany({ where: { userId } }),
);

export default async function Home() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");
  const scenarios = await getScenarios(session.user.id);
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Bienvenue sur Projet Genesis
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-6">
          Créez des scénarios et générez des personnages aléatoirement pour
          vos parties de JDR. Gardez une trace de vos personnages et de vos
          armes, et utilisez librement les attributs déjà définis — vous
          pouvez en suggérer de nouveaux si vous n&apos;êtes pas autorisé à
          les créer vous-même.
        </p>
      </div>
      <ScenarioList scenario={scenarios} />
      <FormPanel className="max-w-xl">
        <h2 className="mb-4 text-base font-semibold">Créer un scénario</h2>
        <ScenarioForm />
      </FormPanel>
    </div>
  );
}
