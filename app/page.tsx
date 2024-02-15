import { LoginButton } from "@/features/layout/auth/LoginButton";
import { UserProfile } from "@/features/layout/auth/UserProfile";
import { getAuthSession } from "@/lib/auth";

export default async function Home() {
  const session = await getAuthSession();
  return (
    <div>
      <h1>Home</h1>
      {session?.user ? <UserProfile /> : <LoginButton />}
    </div>
  );
}
