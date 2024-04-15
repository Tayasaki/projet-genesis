import { LogoutButton } from "@/components/features/layout/auth/LogoutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
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
    where: { id: session?.user.id },
  });

  return (
    <div>
      <Avatar className="size-56">
        <AvatarImage
          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
          alt="Profile picture"
          className="bg-slate-50 dark:bg-slate-900"
        />
        <AvatarFallback>{user.name?.slice(0, 2) ?? "AA"}</AvatarFallback>
      </Avatar>
      <p>nom: {user.name}</p>
      <p>email: {user.email}</p>
      <LogoutButton />
    </div>
  );
}
