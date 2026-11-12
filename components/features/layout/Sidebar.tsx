import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { AppSidebar, type SidebarNavItem } from "./AppSidebar";

export const Sidebar = async () => {
  const session = await getAuthSession();
  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;
  const role = user?.role;
  const [t, tCommon] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
  ]);

  const items: SidebarNavItem[] = session?.user
    ? [
        { href: "/", label: t("home"), icon: "home" },
        ...(role === "ADMIN" || role === "SUPERUSER"
          ? [{ href: "/suggestions", label: t("suggestions"), icon: "suggestions" as const }]
          : []),
        { href: "/manage", label: t("manage"), icon: "manage" },
        { href: "/characters", label: t("myCharacters"), icon: "characters" },
      ]
    : [];

  return (
    <AppSidebar
      items={items}
      appName={tCommon("appName")}
      userName={session?.user?.name ?? null}
    />
  );
};
