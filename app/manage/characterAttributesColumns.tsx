"use client";

import { DeleteDialog } from "@/components/features/layout/DeleteDialog";
import { Button } from "@/components/ui/button";
import { deleteAlignment } from "@/src/actions/character/alignment.action";
import { deleteCharacterSkill } from "@/src/actions/character/characterSkill.action";
import { deleteFortune } from "@/src/actions/character/fortune.action";
import { deleteStrength } from "@/src/actions/character/strength.action";
import { deleteTemperment } from "@/src/actions/character/temperment.action";
import { deleteWeakness } from "@/src/actions/character/weakness.action";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { CharacterAttributes } from "./page";
import { toast } from "sonner";

export const columns: ColumnDef<CharacterAttributes>[] = [
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const r = row.original;
      let type = "";
      switch (r.type) {
        case "temperment":
          type = "tempérament";
          break;
        case "alignement":
          type = "alignement";
          break;
        case "fortune":
          type = "fortune";
          break;
        case "strength":
          type = "force";
          break;
        case "weakness":
          type = "faiblesse";
          break;
        case "skill":
          type = "compétence";
          break;
      }
      return <span className="capitalize">{type}</span>;
    },
  },
  {
    accessorKey: "name",
    header: "Nom",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const r = row.original;
      return (
        <span className={!r.description ? "italic" : ""}>
          {r.description ?? "Pas de description"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: async ({ row }) => {
      const r = row.original;

      return (
        <DeleteDialog
          item={row.original.name}
          deleteItem={async () => {
            let value = null;
            switch (r.type) {
              case "temperment":
                value = await deleteTemperment({ name: r.name });
                break;
              case "alignement":
                value = await deleteAlignment({ name: r.name });
                break;
              case "fortune":
                value = await deleteFortune({ name: r.name });
                break;
              case "strength":
                value = await deleteStrength({ name: r.name });
                break;
              case "weakness":
                value = await deleteWeakness({ name: r.name });
                break;
              case "skill":
                value = await deleteCharacterSkill({ name: r.name });
                break;
            }
            if (value?.serverError) {
              toast.error(
                "Vous n'êtes pas autorisé à supprimer ce type d'attribut",
              );
            }
          }}
        />
      );
    },
  },
];
