import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LogoMark } from "./Logo";

const footerLinkClass =
  "text-sm text-muted-foreground hover:text-foreground transition-colors";

export const Footer = async () => {
  const [t, tCommon, tFooter] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("footer"),
  ]);

  return (
    <footer className="bg-background border-t">
      <div className="container m-auto flex flex-wrap items-center justify-between gap-4 py-6">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark className="size-5" />
          <span className="text-sm font-medium text-muted-foreground">
            {tCommon("appName")}
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/manage" className={cn(footerLinkClass)}>
            {t("manage")}
          </Link>
          <Link href="/characters" className={cn(footerLinkClass)}>
            {t("myCharacters")}
          </Link>
          <Link href="/tos" className={cn(footerLinkClass)}>
            {tFooter("tos")}
          </Link>
          <Link href="/privacy-policy" className={cn(footerLinkClass)}>
            {tFooter("privacyPolicy")}
          </Link>
        </nav>
      </div>
    </footer>
  );
};
