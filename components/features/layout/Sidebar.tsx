import { ToggleTheme } from "@/components/features/theme/ToggleTheme";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LoginButton } from "./auth/LoginButtons";
import { UserProfile } from "./auth/UserProfile";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LogoMark } from "./Logo";
import { SidebarNav, type SidebarNavItem } from "./SidebarNav";

export const Sidebar = async () => {
  const session = await getAuthSession();
  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;
  const role = user?.role;
  const [t, tCommon, tFooter] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("footer"),
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
    <aside className="bg-card/40 sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r md:flex">
      <div className="flex h-14 items-center gap-2.5 border-b px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="size-7" />
          <span className="text-sm font-semibold tracking-tight">
            {tCommon("appName")}
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <SidebarNav items={items} />
      </div>

      <div className="flex flex-col gap-3 border-t p-3">
        {session?.user ? <UserProfile /> : <LoginButton />}
        <div className="flex items-center justify-between px-1">
          <LanguageSwitcher />
          <ToggleTheme />
        </div>
        <div className="flex items-center gap-3 px-1 text-xs">
          <Link
            href="/tos"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {tFooter("tos")}
          </Link>
          <Link
            href="/privacy-policy"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {tFooter("privacyPolicy")}
          </Link>
        </div>
      </div>
    </aside>
  );
};
