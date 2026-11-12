import { buttonVariants } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";
import clsx from "clsx";
import { User2 } from "lucide-react";
import Link from "next/link";

export const UserProfile = async () => {
  const session = await getAuthSession();
  return (
    <Link
      href="/profile"
      className={clsx(
        buttonVariants({ variant: "outline" }),
        "w-full justify-start",
      )}
    >
      <User2 className="mr-2 size-4 shrink-0" />
      <span className="truncate">{session?.user.name ?? ""}</span>
    </Link>
  );
};
