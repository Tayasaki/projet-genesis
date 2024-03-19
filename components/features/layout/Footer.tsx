import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LoginButton } from "./auth/LoginButtons";
import { UserProfile } from "./auth/UserProfile";

export const Footer = () => {
  return (
    <div className="bottom-0-0 z-20 w-full border-t border-t-accent bg-background">
      <div className="container m-auto flex items-center justify-between gap-1 py-2">
        <h1 className="gap-1 text-2xl font-bold">
          <Link href="/">Project Genesis</Link>
        </h1>
        <span>
          <Link
            className={cn(buttonVariants({ variant: "link" }))}
            href={"/manage"}
          >
            Gestion
          </Link>
          <Link
            className={cn(buttonVariants({ variant: "link" }))}
            href={"/characters"}
          >
            Mes personnages
          </Link>
        </span>
      </div>
    </div>
  );
};
