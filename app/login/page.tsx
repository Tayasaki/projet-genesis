import {
  LoginDiscordButton,
  LoginGithubButton,
  LoginGoogleButton,
} from "@/components/features/layout/auth/LoginButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Projet Genesis - Login",
  description:
    "Création de scénarios pour jeux de rôle | Générateur de fiche de personnage",
};

export default async function Login() {
  const session = await getAuthSession();
  if (session) redirect("/");
  return (
    <div className="flex h-full items-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <LoginGoogleButton />
            <LoginGithubButton />
            <LoginDiscordButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
