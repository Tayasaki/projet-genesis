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
      <div
        className={cn(
          "flex h-14 items-center border-b px-5",
          collapsed && "justify-center px-0",
        )}
      >
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark className="size-7" />
            <span className="text-sm font-semibold tracking-tight">
              {appName}
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/">
            <LogoMark className="size-7" />
          </Link>
        )}
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
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed ? "flex-col" : "justify-between",
          )}
        >
          {userName ? (
            <SidebarAccountMenu userName={userName} collapsed={collapsed} />
          ) : (
            <SidebarPreferencesTrigger />
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
            className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-9 shrink-0 items-center justify-center rounded-md transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
