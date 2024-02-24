import { Button } from "@/components/ui/button";
import {
  LoginDiscordButton,
  LoginGithubButton,
} from "@/features/layout/auth/LoginButtons";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Login() {
  const session = await getAuthSession();
  if (session) redirect("/");
  return (
    <div>
      <h1>Login</h1>
      <LoginGithubButton />
      <LoginDiscordButton />
    </div>
  );
}
