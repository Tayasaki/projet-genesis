import { ToggleTheme } from "@/components/features/theme/ToggleTheme";
import { LanguageSwitcher } from "@/components/features/layout/LanguageSwitcher";
import { LogoMark } from "@/components/features/layout/Logo";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [tCommon, tFooter] = await Promise.all([
    getTranslations("common"),
    getTranslations("footer"),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b px-5 md:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="size-7" />
          <span className="text-sm font-semibold tracking-tight">
            {tCommon("appName")}
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ToggleTheme />
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <div className="container mx-auto flex max-w-5xl flex-1 flex-col px-5 py-8 md:px-10 md:py-10">
          {children}
        </div>
      </main>

      <footer className="flex items-center justify-center gap-6 border-t px-5 py-5 text-sm md:px-10">
        <Link
          href="/tos"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {tFooter("tos")}
        </Link>
        <Link
          href="/privacy-policy"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {tFooter("privacyPolicy")}
        </Link>
      </footer>
    </div>
  );
}
