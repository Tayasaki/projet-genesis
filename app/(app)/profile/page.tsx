import {
  DeleteAccountButton,
  LogoutButton,
} from "@/components/features/layout/auth/LogoutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";
import { charactersOwnedBy } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { BookOpen, Swords, Users } from "lucide-react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("profile"), description: t("appDescription") };
}

export default async function Profile() {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session?.user?.id ?? "" },
  });

  const [nbScenario, nbCharacter, nbWeapon] = await Promise.all([
    prisma.scenario.count({ where: { userId: user.id } }),
    prisma.character.count({ where: charactersOwnedBy(user.id) }),
    prisma.weapon.count({ where: { userId: user.id } }),
  ]);
  const t = await getTranslations("profile");

  const stats = [
    { icon: BookOpen, label: t("scenarios"), value: nbScenario },
    { icon: Users, label: t("characters"), value: nbCharacter },
    { icon: Swords, label: t("weapons"), value: nbWeapon },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-5">
        <Avatar className="size-20">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
            alt={t("profilePictureAlt")}
            className="bg-slate-200 dark:bg-slate-900"
          />
          <AvatarFallback>{user.name?.slice(0, 2) ?? "AA"}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {user.name}
          </h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
        <div className="ml-auto">
          <LogoutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
                <Icon className="text-primary size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight">
                  {value}
                </p>
                <p className="text-muted-foreground text-sm">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-destructive/30">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h2 className="text-sm font-semibold">{t("dangerZone")}</h2>
            <p className="text-muted-foreground text-sm">
              {t("dangerZoneDescription")}
            </p>
          </div>
          <DeleteAccountButton />
        </CardContent>
      </Card>
    </div>
  );
}
