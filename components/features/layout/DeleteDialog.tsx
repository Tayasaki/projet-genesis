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
import { XCircle, XSquare } from "lucide-react";
import { toast } from "sonner";

export const DeleteDialog = ({
  item,
  deleteItem,
}: {
  item: string;
  deleteItem: () => void;
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <XCircle
          className="rounded-lg transition hover:ring-2 hover:ring-destructive"
          size={24}
          color="red"
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Vous êtes sûr? 😟</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action ne pourra pas être annulée. Elle va supprimer &quot;
            {item}&quot; de façon permanente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 text-white hover:bg-red-700"
            onClick={async () => {
              deleteItem();
              toast.success("Supprimé");
            }}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
