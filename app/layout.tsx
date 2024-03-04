import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Header } from "@/src/features/layout/Header";
import clsx from "clsx";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Projet Genesis",
  description:
    "Création de scénarios pour jeux de rôle | Générateur de fiche de personnage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={clsx(inter.className, "h-full bg-background ")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex h-full w-full flex-col">
            <Header />
            <main className="m-auto h-full max-w-5xl flex-1 py-16">
              {children}
            </main>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
