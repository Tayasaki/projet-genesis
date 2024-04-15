import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/public/logo.png";
import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bottom-0 w-full border-t border-t-accent bg-gray-100 transition dark:bg-slate-900">
      <div className="container m-auto flex items-center justify-between gap-1 py-2">
        <h1 className="gap-1 text-2xl font-bold">
          <Link href="/" className="flex">
            <Image src={logo} alt="logo" width={32} className="dark:" />
            Project Genesis
          </Link>
        </h1>
        <span>
          <Link
            className={cn(buttonVariants({ variant: "link" }))}
            href={"/manage"}
          >
            Gestion
          </Link>
          <Link
            className={cn(buttonVariants({ variant: "link" }))}
            href={"/characters"}
          >
            Mes personnages
          </Link>
        </span>
      </div>
    </footer>
  );
};
