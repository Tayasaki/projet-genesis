import { Footer } from "@/components/features/layout/Footer";
import { Header } from "@/components/features/layout/Header";
import { ThemeProvider } from "@/components/features/theme/ThemeProvider";
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
    <html lang="en" suppressHydrationWarning>
      <body className={clsx(inter.className, "h-full bg-background ")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex size-full flex-col">
            <Header />
            <main className="m-auto h-full max-w-5xl flex-1 py-24">
              {children}
            </main>
            <Footer />
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
