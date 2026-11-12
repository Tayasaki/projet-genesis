"use client";

import { Button } from "@/components/ui/button";
import { setLocale } from "@/src/actions/locale.action";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const next = locale === "fr" ? "en" : "fr";

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      aria-label={next === "fr" ? "Passer en français" : "Switch to English"}
      onClick={() =>
        startTransition(async () => {
          await setLocale(next);
          router.refresh();
        })
      }
    >
      {locale.toUpperCase()}
    </Button>
  );
}
