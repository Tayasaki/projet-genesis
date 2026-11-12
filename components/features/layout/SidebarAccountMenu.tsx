"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { LogOut, User2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useTransition } from "react";
import { PreferencesMenuContent } from "./PreferencesMenuContent";

const itemClass =
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors";

export function SidebarAccountMenu({
  userName,
}: {
  userName: string;
}) {
  const t = useTranslations("account");
  const tFooter = useTranslations("footer");
  const [isPending, startTransition] = useTransition();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label={userName}
          className="w-full justify-start overflow-hidden transition-[width,padding] duration-200 ease-linear group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-2"
        >
          <User2 className="size-4 shrink-0" />
          <span className="truncate group-data-[collapsible=icon]:hidden">
            {userName}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" className="w-64 p-2">
        <Link href="/profile" className={itemClass}>
          <User2 className="size-4" />
          {t("viewProfile")}
        </Link>

        <div className="my-2 border-t" />
        <PreferencesMenuContent />
        <div className="my-2 border-t" />

        <Link href="/tos" className={itemClass}>
          {tFooter("tos")}
        </Link>
        <Link href="/privacy-policy" className={itemClass}>
          {tFooter("privacyPolicy")}
        </Link>

        <div className="my-2 border-t" />
        <button
          type="button"
          disabled={isPending}
          className={cn(
            itemClass,
            "text-destructive hover:bg-destructive/10",
          )}
          onClick={() => {
            startTransition(() => {
              signOut();
            });
          }}
        >
          <LogOut className="size-4" />
          {t("logOut")}
        </button>
      </PopoverContent>
    </Popover>
  );
}
