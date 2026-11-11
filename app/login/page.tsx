import {
  LoginDiscordButton,
  LoginGithubButton,
  LoginGoogleButton,
} from "@/components/features/layout/auth/LoginButtons";
import { LogoMark } from "@/components/features/layout/Logo";
import { FormPanel } from "@/components/ui/form-panel";
import { getAuthSession } from "@/lib/auth";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Projet Genesis - Login",
  description:
    "Création de scénarios pour jeux de rôle | Générateur de fiche de personnage",
};

export default async function Login() {
  const session = await getAuthSession();
  if (session) redirect("/");
  const t = await getTranslations("login");
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden">
      <div
        aria-hidden
        className="bg-primary/10 pointer-events-none absolute top-1/2 left-1/2 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
      />
      <FormPanel className="relative mx-auto flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <LogoMark className="size-10" />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </div>
        <div className="grid w-full gap-3">
          <LoginGoogleButton />
          <LoginGithubButton />
          <LoginDiscordButton />
        </div>
      </FormPanel>
    </div>
  );
}
