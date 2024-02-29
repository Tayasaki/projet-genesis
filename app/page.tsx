import { ScenarioForm } from "@/components/form/ScenarioForm";
import { ScenarioList } from "@/src/features/scenario/ScenarioList";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getAuthSession();
  if (!session?.user.id) redirect("/login");
  return (
    <>
      <ScenarioList />
      <ScenarioForm />
    </>
  );
}
