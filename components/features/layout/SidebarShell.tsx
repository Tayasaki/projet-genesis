"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { LoginButton } from "./auth/LoginButtons";
import { LogoMark } from "./Logo";
import { SidebarAccountMenu } from "./SidebarAccountMenu";
import { SidebarNav, type SidebarNavItem } from "./SidebarNav";
import { SidebarPreferencesTrigger } from "./PreferencesMenuContent";

export function SidebarShell({
  items,
  appName,
  userName,
}: {
  items: SidebarNavItem[];
  appName: string;
  userName: string | null;
}) {
  const t = useTranslations("common");
  const [collapsed, setCollapsed] = useState(false);

  function toggle() {
    setCollapsed((prev) => !prev);
  }

  return (
    <aside
      className={cn(
        "bg-card/40 sticky top-0 hidden h-screen shrink-0 flex-col border-r transition-[width] duration-150 md:flex",
        collapsed ? "w-[68px]" : "w-64",
      )}
    >
      <div className="flex h-14 items-center justify-between border-b pr-2 pl-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <LogoMark className="size-7 shrink-0" />
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
              {appName}
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
          className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <SidebarNav items={items} collapsed={collapsed} />
      </div>

      <div className="flex flex-col gap-2 border-t p-3">
        {!userName && !collapsed && <LoginButton />}
        {!userName && collapsed && (
          <Link
            href="/login"
            title={t("login")}
            className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-9 items-center justify-center self-center rounded-md border transition-colors"
          >
            <LogIn className="size-4" />
          </Link>
        )}
        {!userName && <SidebarPreferencesTrigger />}
        {userName && (
          <SidebarAccountMenu userName={userName} collapsed={collapsed} />
        )}
      </div>
    </aside>
  );
}
