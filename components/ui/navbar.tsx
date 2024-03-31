import { cn } from "@/lib/utils";
import React from "react";
import { buttonVariants } from "./button";
import Link from "next/link";
import { Slash } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="flex items-center pb-8 text-2xl">
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
  );
};
