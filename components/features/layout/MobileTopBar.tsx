import { ToggleTheme } from "@/components/features/theme/ToggleTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Menu } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LoginButton } from "./auth/LoginButtons";
import { UserProfile } from "./auth/UserProfile";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LogoMark } from "./Logo";

export const MobileTopBar = async () => {
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

  return (
    <header className="bg-background/95 sticky top-0 z-20 flex h-14 items-center justify-between border-b px-4 backdrop-blur-sm md:hidden">
      <Link href="/" className="flex items-center gap-2.5">
        <LogoMark className="size-7" />
        <span className="text-sm font-semibold tracking-tight">
          {tCommon("appName")}
        </span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Menu">
            <Menu className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {session?.user && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/">{t("home")}</Link>
              </DropdownMenuItem>
              {(role === "ADMIN" || role === "SUPERUSER") && (
                <DropdownMenuItem asChild>
                  <Link href="/suggestions">{t("suggestions")}</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/manage">{t("manage")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/characters">{t("myCharacters")}</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">{session.user.name}</Link>
              </DropdownMenuItem>
            </>
          )}
          {!session?.user && (
            <DropdownMenuItem asChild>
              <div>
                <LoginButton />
              </div>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center justify-between font-normal">
            <LanguageSwitcher />
            <ToggleTheme />
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/tos">{tFooter("tos")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/privacy-policy">{tFooter("privacyPolicy")}</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
