"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, XCircle } from "lucide-react";
import { hasActionError } from "@/lib/action-result";
import { signOut, useSession } from "@/lib/auth-client";
import { deleteAccount } from "@/src/actions/account.action";
import { useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

export const LogoutButton = () => {
  const t = useTranslations("account");
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant={"outline"}
      onClick={() => {
        startTransition(() => {
          signOut();
        });
      }}
    >
      {isPending ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 size-4" />
      )}
      {t("logOut")}
    </Button>
  );
};

export const DeleteAccountButton = () => {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  // The ref blocks a second click before React re-renders the disabled state.
  const inFlight = useRef(false);

  const handleDelete = async () => {
    if (!userId || inFlight.current) return;
    inFlight.current = true;
    setIsPending(true);
    let erased = false;
    try {
      erased = !hasActionError(await deleteAccount({ sessionId: userId }));
    } catch {
      erased = false;
    }
    if (!erased) {
      toast.error(t("deleteAccountFailed"));
      setOpen(false);
      setIsPending(false);
      inFlight.current = false;
      return;
    }
    // The account is already gone, so a failed sign-out must not block the
    // redirect: the session row no longer exists server-side. A hard
    // navigation (not router.replace) drops the cached server-rendered header
    // that still shows the deleted user.
    try {
      await signOut();
    } catch {}
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload on purpose
    window.location.assign("/login");
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !isPending && setOpen(next)}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {t("deleteAccount")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteAccountTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteAccountDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {tCommon("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending || !userId}
            onClick={(event) => {
              // Keep the dialog open (and the button disabled) until the
              // erasure settles.
              event.preventDefault();
              void handleDelete();
            }}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("deleteAccount")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
