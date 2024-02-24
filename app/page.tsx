import { ScenarioForm } from "@/components/form/ScenarioForm";
import { LoginButton } from "@/features/layout/auth/LoginButtons";
import { UserProfile } from "@/features/layout/auth/UserProfile";
import { ScenarioList } from "@/features/layout/scenario/ScenarioList";
import { getAuthSession } from "@/lib/auth";

export default async function Home() {
  const session = await getAuthSession();
  return (
    <div>
      <h1>Home</h1>
      {session?.user ? <UserProfile /> : <LoginButton />}
      <ScenarioList />
      <ScenarioForm userId={session?.user.id} />
    </div>
  );
}
