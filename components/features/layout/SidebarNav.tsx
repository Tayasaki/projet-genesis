"use client";

import { cn } from "@/lib/utils";
import { BookOpen, LayoutGrid, Lightbulb, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export function SidebarNav({
  items,
  collapsed,
}: {
  items: SidebarNavItem[];
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              collapsed && "justify-center px-0",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed && item.label}
          </Link>
        );
      })}
    </nav>
  );
}
