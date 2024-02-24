"use client";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTransition } from "react";

export const LogoutButton = () => {
  const [isPending, startTransition] = useTransition();
  return (
    <Button onClick={() => startTransition(() => signOut())}>
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      Log out
    </Button>
  );
};
