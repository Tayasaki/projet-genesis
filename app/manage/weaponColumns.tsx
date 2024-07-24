"use client";

import { DeleteDialog } from "@/components/features/layout/DeleteDialog";
import { Button } from "@/components/ui/button";
import { deleteWeapon } from "@/src/actions/weapon/weapon.action";
import { Weapon } from "@/src/query/weapon.query";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Swords } from "lucide-react";
import { toast } from "sonner";

export const columns: ColumnDef<Weapon>[] = [
  {
    accessorKey: "name",
    header: "Nom",
  },
  {
    accessorKey: "melee",
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
      return row.original.melee ? <Swords /> : "🔫";
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <span className={!row.original.description ? "italic" : ""}>
          {row.original.description || "Pas de description"}
        </span>
      );
    },
  },
  {
    accessorKey: "damage.name",
    header: "Dégâts",
  },
  {
    accessorKey: "range.name",
    header: "Portée",
  },
  {
    accessorKey: "weight.name",
    header: "Poids",
  },
  {
    accessorKey: "ammo.name",
    header: "Munition",
    cell: ({ row }) => {
      return row.original.melee ? "N/A" : row.original.ammo?.name;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <DeleteDialog
          item={row.original.name}
          deleteItem={async () => {
            await deleteWeapon({ id: row.original.id });
            toast.success(`${row.original.name} supprimé`);
          }}
        />
      );
    },
  },
];
