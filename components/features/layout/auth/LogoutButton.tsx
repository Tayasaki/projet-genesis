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
import { signOut } from "@/lib/auth-client";
import { useTransition } from "react";

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
  return (
    <AlertDialog>
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
          <AlertDialogTitle>Cette action est irréversible 🤯</AlertDialogTitle>
          <AlertDialogDescription>
            En continuant, vous supprimerez votre compte et toute les données
            liées à ce dernier. Etes vous sûr et certain de vouloir tout
            supprimer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={async () => {}}>
            Supprimer mon compte
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
