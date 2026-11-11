import { ToggleTheme } from "@/components/features/theme/ToggleTheme";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LoginButton } from "./auth/LoginButtons";
import { LogoMark } from "./Logo";
import { UserProfile } from "./auth/UserProfile";

const navLinkClass = "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors";

export const Header = async () => {
  const session = await getAuthSession();
  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;
  const role = user?.role;

  return (
    <header className="bg-background/95 fixed top-0 z-20 w-full border-b backdrop-blur-sm">
      <div className="container m-auto flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark className="size-7" />
            <span className="text-sm font-semibold tracking-tight">
              Projet Genesis
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            {(role === "ADMIN" || role === "SUPERUSER") && (
              <Link href="/suggestions" className={cn(navLinkClass)}>
                Suggestions
              </Link>
            )}
            <Link href="/manage" className={cn(navLinkClass)}>
              Gestion
            </Link>
            <Link href="/characters" className={cn(navLinkClass)}>
              Mes personnages
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {session?.user ? <UserProfile /> : <LoginButton />}
          <ToggleTheme />
        </div>
      </div>
    </header>
  );
};
