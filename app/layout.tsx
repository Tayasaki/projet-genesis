import { Footer } from "@/components/features/layout/Footer";
import { Header } from "@/components/features/layout/Header";
import { ThemeProvider } from "@/components/features/theme/ThemeProvider";
import clsx from "clsx";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Projet Genesis",
  description:
    "Création de scénarios pour jeux de rôle | Générateur de fiche de personnage",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={clsx(
          inter.className,
          "dark:bg-background dark:from-background dark:to-background h-full bg-gradient-to-b from-slate-50/40 from-80% to-white",
        )}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex size-full min-h-screen flex-col">
              <Header />
              <main className="container m-auto h-full max-w-5xl flex-1 pt-24 pb-16">
                {children}
              </main>
              <Footer />
              <Toaster />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
