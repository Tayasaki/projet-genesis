"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { setLocale } from "@/src/actions/locale.action";
import { Languages, Moon, Settings2, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const rowClass =
  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors";

export function PreferencesMenuContent() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { theme, setTheme } = useTheme();
  const nextLocale = locale === "fr" ? "en" : "fr";

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={isPending}
        className={rowClass}
        onClick={() =>
          startTransition(async () => {
            await setLocale(nextLocale);
            router.refresh();
          })
        }
      >
        <span className="flex items-center gap-2">
          <Languages className="size-4" />
          {t("language")}
        </span>
        <span className="text-muted-foreground">{locale.toUpperCase()}</span>
      </button>
      <button
        type="button"
        className={rowClass}
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <span className="flex items-center gap-2">
          {theme === "light" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
          {t("theme")}
        </span>
        <span className="text-muted-foreground capitalize">{theme}</span>
      </button>
    </div>
  );
}

export function SidebarPreferencesTrigger() {
  const t = useTranslations("common");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label={t("preferences")}>
          <Settings2 className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" className="w-56 p-2">
        <PreferencesMenuContent />
      </PopoverContent>
    </Popover>
  );
}
