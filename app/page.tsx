import { ScenarioList } from "@/components/features/layout/ScenarioList";
import { ScenarioForm } from "@/components/form/ScenarioForm";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await getAuthSession();
  if (!session?.user.id) redirect("/login");
  const scenarios = await prisma.scenario.findMany({
    where: {
      userId: session.user.id,
    },
  });
  return (
    <main className="flex flex-col gap-4">
      <ScenarioList scenario={scenarios} />
      <ScenarioForm />
    </main>
  );
}
