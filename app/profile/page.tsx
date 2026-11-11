import {
  DeleteAccountButton,
  LogoutButton,
} from "@/components/features/layout/auth/LogoutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAuthSession } from "@/lib/auth";
import { charactersOwnedBy } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Projet Genesis - Profil",
  description:
    "Création de scénarios pour jeux de rôle | Générateur de fiche de personnage",
};

export default async function Profile() {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session?.user?.id ?? "" },
  });

  const nbScenario = await prisma.scenario.count({
    where: { userId: user.id },
  });
  const nbCharacter = await prisma.character.count({
    where: charactersOwnedBy(user.id),
  });
  const nbWeapon = await prisma.weapon.count({
    where: {
      userId: user.id,
    },
  });
  const t = await getTranslations("profile");

  return (
    <div className="flex">
      <div className="mr-8 flex flex-col items-center space-y-3">
        <Avatar className="size-56">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
            alt={t("profilePictureAlt")}
            className="bg-slate-200 dark:bg-slate-900"
          />
          <AvatarFallback>{user.name?.slice(0, 2) ?? "AA"}</AvatarFallback>
        </Avatar>
        <LogoutButton />
        <DeleteAccountButton />
      </div>
      <div>
        <h1 className="mb-3 text-5xl font-semibold">{user.name}</h1>
        <p className="italic">{user.email}</p>
        <div className="p-4">
          <p>
            {nbScenario === 0 ? t("none") : nbScenario}{" "}
            {t("scenariosCreatedSuffix")}
          </p>
          <p>
            {nbCharacter === 0 ? t("none") : nbCharacter}{" "}
            {t("charactersCreatedSuffix")}
          </p>
          <p>
            {nbWeapon === 0 ? t("noneFeminine") : nbWeapon}{" "}
            {t("weaponsReadySuffix")}
          </p>
        </div>
      </div>
    </div>
  );
}
