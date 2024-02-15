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
      className={clsx(buttonVariants({ variant: "outline" }))}
    >
      <User2 className="mr-2 h-4 w-4" />
      {session?.user.name ?? ""}
    </Link>
  );
};
