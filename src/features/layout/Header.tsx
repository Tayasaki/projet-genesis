import { ToggleTheme } from "@/components/theme/ToggleTheme";
import { getAuthSession } from "@/lib/auth";
import Link from "next/link";
import { LoginButton } from "./auth/LoginButtons";
import { UserProfile } from "./auth/UserProfile";

export const Header = async () => {
  const session = await getAuthSession();
  return (
    <header className="fixed top-0 z-20 w-full border-b border-b-accent bg-background">
      <div className="container m-auto flex items-center justify-between gap-1 py-2">
        <h1 className="gap-1 text-2xl font-bold">
          <Link href="/">Project Genesis</Link>
        </h1>
        <span>
          <Link className="italic" href={"/manage"}>
            Gestion
          </Link>
        </span>
        <div className="flex space-x-2">
          {session?.user ? <UserProfile /> : <LoginButton />}
          <ToggleTheme />
        </div>
      </div>
    </header>
  );
};
