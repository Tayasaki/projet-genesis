"use client";

import { Button } from "@/components/ui/button";
import { deleteWeapon } from "@/src/actions/weapon/weapon.action";
import { Weapon } from "@/src/query/weapon.query";
import { ColumnDef } from "@tanstack/react-table";
import { XSquare } from "lucide-react";
import { toast } from "sonner";

export const columns: ColumnDef<Weapon>[] = [
  {
    accessorKey: "name",
    header: "Nom",
  },
  {
    accessorKey: "melee",
    header: "Mêlée",
    cell: ({ row }) => {
      return row.original.melee ? "🗡" : "🔫";
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
        <Button
          onClick={async () => {
            await deleteWeapon({ id: row.original.id });
            toast.success("Supprimé");
          }}
          variant={"destructive"}
        >
          <XSquare />
        </Button>
      );
    },
  },
];
