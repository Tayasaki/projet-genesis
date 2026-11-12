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

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/" className="flex h-8 items-center gap-2.5 overflow-hidden px-0.5">
          <LogoMark className="size-7 shrink-0" />
          <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
            {appName}
          </span>
        </Link>
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
        {!userName && (
          <>
            <div className="group-data-[collapsible=icon]:hidden">
              <LoginButton />
            </div>
            <SidebarMenuButton
              asChild
              tooltip={t("login")}
              className="hidden group-data-[collapsible=icon]:flex"
            >
              <Link href="/login">
                <LogIn />
                <span>{t("login")}</span>
              </Link>
            </SidebarMenuButton>
            <SidebarPreferencesTrigger />
          </>
        )}
        {userName && <SidebarAccountMenu userName={userName} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
