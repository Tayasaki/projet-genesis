"use client";

import { DeleteDialog } from "@/components/features/layout/DeleteDialog";
import { Button } from "@/components/ui/button";
import { deleteAmmo } from "@/src/actions/weapon/ammo.action";
import { deleteDamage } from "@/src/actions/weapon/damage.action";
import { deleteRange } from "@/src/actions/weapon/range.action";
import { deleteWeaponSkill } from "@/src/actions/weapon/weaponSkill.action";
import { deleteWeight } from "@/src/actions/weapon/weight.action";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { CharacterAttributes } from "./page";

// One entry per row (label + delete action) instead of a switch duplicated
// across both the label cell and the delete handler — adding a new
// attribute type is now a single new entry here.
const WEAPON_ATTRIBUTE_CONFIG: Record<
  string,
  {
    label: string;
    delete: (name: string) => Promise<{ serverError?: unknown } | void>;
  }
> = {
  ammo: { label: "munitions", delete: (name) => deleteAmmo({ name }) },
  damage: { label: "dégâts", delete: (name) => deleteDamage({ name }) },
  range: { label: "portée", delete: (name) => deleteRange({ name }) },
  weight: { label: "poids", delete: (name) => deleteWeight({ name }) },
  skill: { label: "compétence", delete: (name) => deleteWeaponSkill({ name }) },
};

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
      const type = WEAPON_ATTRIBUTE_CONFIG[row.original.type]?.label ?? "";
      return <span className="capitalize">{type}</span>;
    },
  },
  {
    accessorKey: "name",
    header: "Nom",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const r = row.original;
      return (
        <DeleteDialog
          item={row.original.name}
          deleteItem={async () => {
            const value = await WEAPON_ATTRIBUTE_CONFIG[r.type]?.delete(r.name);
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
