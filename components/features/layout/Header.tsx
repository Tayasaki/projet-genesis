import { ToggleTheme } from "@/components/features/theme/ToggleTheme";
import { buttonVariants } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import logo from "@/public/logo.png";
import { Slash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LoginButton } from "./auth/LoginButtons";
import { UserProfile } from "./auth/UserProfile";

export const Header = async () => {
  const session = await getAuthSession();
  const user = await prisma.user.findUnique({
    where: { id: session?.user.id ?? "" },
  });

  return (
    <header className="fixed top-0 z-20 w-full border-b border-b-accent bg-background">
      <div className="container m-auto flex items-center justify-between gap-1 py-2">
        <h1 className="gap-1 text-2xl font-bold">
          <Link href="/" className="flex">
            <Image src={logo} alt="logo" width={32} className="dark:" />
            Project Genesis
          </Link>
        </h1>
        <nav className="flex items-center">
          {(user?.role === "ADMIN" || user?.role === "SUPERUSER") && (
            <>
              <Link
                className={cn(buttonVariants({ variant: "link" }))}
                href={"/suggestions"}
              >
                Suggestions
              </Link>
              <Slash className="size-4 text-muted" />
            </>
          )}
          <Link
            className={cn(buttonVariants({ variant: "link" }))}
            href={"/manage"}
          >
            Gestion
          </Link>
          <Slash className="size-4 text-muted" />
          <Link
            className={cn(buttonVariants({ variant: "link" }))}
            href={"/characters"}
          >
            Mes personnages
          </Link>
        </nav>

        <div className="flex space-x-2">
          {session?.user ? <UserProfile /> : <LoginButton />}
          <ToggleTheme />
        </div>
      </div>
    </header>
  );
};
