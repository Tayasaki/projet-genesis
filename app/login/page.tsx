import {
  LoginDiscordButton,
  LoginGithubButton,
  LoginGoogleButton,
} from "@/components/features/layout/auth/LoginButtons";
import { LoginForm } from "@/components/form/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAuthSession } from "@/lib/auth";
import { Metadata } from "next";
import Link from "next/link";
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
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Entrez votre email et votre mot de passe pour vous connecter à votre
          compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <LoginForm />
          <div className="flex items-center gap-2">
            <Separator className="w-1/3" />
            <span className="text-gray-300">or</span>
            <Separator className="w-1/3" />
          </div>
          <LoginGoogleButton />
          <LoginGithubButton />
          <LoginDiscordButton />
        </div>
        <div className="mt-4 text-center text-sm">
          Vous n&apos;avez pas de compte?{" "}
          <Link href="/sign-up" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
