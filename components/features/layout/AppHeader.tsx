"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { LogoMark } from "./Logo";

type Crumb = { label: string; href?: string };

export function AppHeader({
  scenarios,
}: {
  scenarios: { id: string; name: string }[];
}) {
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const tForm = useTranslations("characterForm");
  const pathname = usePathname();
  const tCard = useTranslations("characterCard");
  const [first, second, third] = pathname.split("/").filter(Boolean);

  const crumbs = ((): Crumb[] => {
    const home = { label: tNav("home"), href: "/" };
    const mine = { label: tNav("myCharacters"), href: "/characters" };
    switch (first) {
      case undefined:
        return [{ label: home.label }];
      case "characters":
        if (!second) return [{ label: mine.label }];
        return [
          mine,
          ...(second === "new"
            ? [{ label: tForm("generationPageTitle") }]
            : third === "edit"
              ? [
                  { label: tCard("detail"), href: `/characters/${second}` },
                  { label: tForm("editPageTitle") },
                ]
              : [{ label: tCard("detail") }]),
        ];
      case "manage":
        return [{ label: tNav("manage") }];
      case "suggestions":
        return [{ label: tNav("suggestions") }];
      case "profile":
        return [{ label: tNav("profile") }];
      default: {
        const scenario = scenarios.find((s) => s.id === first);
        const name = scenario?.name ?? tNav("home");
        return third
          ? [home, { label: name, href: `/${first}/characters` }]
          : [home, { label: name }];
      }
    }
  })();

  return (
    <header className="bg-background/95 sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur-sm md:px-6">
      <Link href="/" className="flex items-center gap-2.5 md:hidden">
        <LogoMark className="size-7" />
        <span className="text-sm font-semibold tracking-tight">
          {tCommon("appName")}
        </span>
      </Link>
      <SidebarTrigger
        aria-label={tCommon("toggleSidebar")}
        className="max-md:ml-auto"
      />
      <Separator orientation="vertical" className="hidden h-4 md:block" />
      <Breadcrumb className="hidden md:block">
        <BreadcrumbList>
          {crumbs.map((c, i) => (
            <Fragment key={`${c.label}-${i}`}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {c.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={c.href}>{c.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
