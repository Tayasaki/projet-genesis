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
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

export const LogoutButton = () => {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant={"destructive"}
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
      Log out
    </Button>
  );
};

export const DeleteAccountButton = () => {
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
      toast.error(
        "La suppression du compte a échoué. Votre compte n'a pas été supprimé.",
      );
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
          variant="destructive"
          className="rounded-md bg-gray-200 text-destructive hover:bg-gray-200/70"
        >
          Supprimer mon compte
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Supprimer définitivement votre compte ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Seront supprimés : votre compte, vos
            sessions, vos scénarios, vos personnages et vos armes. Les
            suggestions que vous avez déjà soumises sont conservées de façon
            anonyme.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
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
            Supprimer mon compte
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
