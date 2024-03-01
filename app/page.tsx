import { ScenarioForm } from "@/components/form/ScenarioForm";
import { getAuthSession } from "@/lib/auth";
import { ScenarioList } from "@/src/features/scenario/ScenarioList";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getAuthSession();
  if (!session?.user.id) redirect("/login");
  return (
    <main className="flex flex-col gap-4">
      <ScenarioList />
      <ScenarioForm />
    </main>
  );
}
