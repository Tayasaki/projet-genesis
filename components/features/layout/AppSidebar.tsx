"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { BookOpen, LayoutGrid, Lightbulb, LogIn, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LoginButton } from "./auth/LoginButtons";
import { LogoMark } from "./Logo";
import { SidebarAccountMenu } from "./SidebarAccountMenu";
import { SidebarPreferencesTrigger } from "./PreferencesMenuContent";

const ICONS = {
  home: BookOpen,
  suggestions: Lightbulb,
  manage: LayoutGrid,
  characters: Users,
} as const;

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
};

export function AppSidebar({
  items,
  appName,
  userName,
}: {
  items: SidebarNavItem[];
  appName: string;
  userName: string | null;
}) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div
          className={
            collapsed
              ? "flex flex-col items-center gap-1 py-1"
              : "flex items-center justify-between gap-2 px-1 py-1"
          }
        >
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <LogoMark className="size-7 shrink-0" />
            {!collapsed && (
              <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
                {appName}
              </span>
            )}
          </Link>
          <SidebarTrigger aria-label={t("toggleSidebar")} />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => {
              const Icon = ICONS[item.icon];
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                    <Link href={item.href}>
                      <Icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!userName && !collapsed && <LoginButton />}
        {!userName && collapsed && (
          <SidebarMenuButton asChild tooltip={t("login")}>
            <Link href="/login">
              <LogIn />
              <span>{t("login")}</span>
            </Link>
          </SidebarMenuButton>
        )}
        {!userName && <SidebarPreferencesTrigger />}
        {userName && (
          <SidebarAccountMenu userName={userName} collapsed={collapsed} />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
