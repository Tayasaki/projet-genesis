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
import { BookOpen, Swords, Users } from "lucide-react";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("login"), description: t("appDescription") };
}

export default async function Login() {
  const session = await getAuthSession();
  if (session) redirect("/");
  const t = await getTranslations("login");
  const features = [
    { icon: BookOpen, label: t("featureScenarios") },
    { icon: Users, label: t("featureCharacters") },
    { icon: Swords, label: t("featureWeapons") },
  ];
  return (
    <div className="grid flex-1 items-center gap-12 md:grid-cols-2">
      <div className="hidden flex-col gap-8 md:flex">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight">
            {t("heroTitle")}
          </h1>
          <p className="text-muted-foreground max-w-md text-base leading-7">
            {t("heroDescription")}
          </p>
        </div>
        <ul className="flex flex-col gap-4">
          {features.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Icon className="text-primary size-4" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
      <FormPanel className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 p-8 text-center">
        <LogoMark className="size-10" />
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-semibold tracking-tight md:hidden">
            {t("title")}
          </h2>
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
