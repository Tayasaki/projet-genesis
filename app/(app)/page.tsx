import { PageHeader } from "@/components/ui/page-header";
import { ScenarioList } from "@/components/features/layout/ScenarioList";
import { CreateScenarioDialog } from "@/components/form/CreateScenarioDialog";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { cache } from "react";

const getScenarios = cache((userId: string) =>
  prisma.scenario.findMany({
    where: { userId },
    include: { _count: { select: { character: true } } },
  }),
);

export default async function Home() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");
  const scenarios = await getScenarios(session.user.id);
  const t = await getTranslations("home");
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={<CreateScenarioDialog />}
      />
      <ScenarioList scenario={scenarios} />
    </div>
  );
}
