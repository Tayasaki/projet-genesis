import { ScenarioList } from "@/components/features/layout/ScenarioList";
import { ScenarioForm } from "@/components/form/ScenarioForm";
import { FormPanel } from "@/components/ui/form-panel";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { cache } from "react";

const getScenarios = cache((userId: string) =>
  prisma.scenario.findMany({ where: { userId } }),
);

export default async function Home() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");
  const scenarios = await getScenarios(session.user.id);
  const t = await getTranslations("home");
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-6">
          {t("description")}
        </p>
      </div>
      <ScenarioList scenario={scenarios} />
      <FormPanel className="max-w-xl">
        <h2 className="mb-4 text-base font-semibold">{t("createScenario")}</h2>
        <ScenarioForm />
      </FormPanel>
    </div>
  );
}
