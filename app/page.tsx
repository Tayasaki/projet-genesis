import { ScenarioForm } from "@/components/form/ScenarioForm";
import { ScenarioList } from "@/features/layout/scenario/ScenarioList";
import { getAuthSession } from "@/lib/auth";

export default async function Home() {
  const session = await getAuthSession();
  return (
    <div>
      <ScenarioList />
      <ScenarioForm userId={session?.user.id} />
    </div>
  );
}
