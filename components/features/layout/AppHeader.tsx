"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { LogoMark } from "./Logo";

export function AppHeader() {
  const tCommon = useTranslations("common");

  return (
    <header className="bg-background/95 sticky top-0 z-20 flex h-14 items-center justify-between px-4 backdrop-blur-sm max-md:border-b md:h-12 md:justify-start md:px-6">
      <Link href="/" className="flex items-center gap-2.5 md:hidden">
        <LogoMark className="size-7" />
        <span className="text-sm font-semibold tracking-tight">
          {tCommon("appName")}
        </span>
      </Link>
      <SidebarTrigger aria-label={tCommon("toggleSidebar")} />
    </header>
  );
}
