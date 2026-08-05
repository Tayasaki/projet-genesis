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

// One entry per row (label + delete action) instead of a switch duplicated
// across both the label cell and the delete handler — adding a new
// attribute type is now a single new entry here.
const CHARACTER_ATTRIBUTE_CONFIG: Record<
  string,
  {
    label: string;
    delete: (name: string) => Promise<{ serverError?: unknown } | void>;
  }
> = {
  temperment: {
    label: "tempérament",
    delete: (name) => deleteTemperment({ name }),
  },
  alignement: {
    label: "alignement",
    delete: (name) => deleteAlignment({ name }),
  },
  fortune: { label: "fortune", delete: (name) => deleteFortune({ name }) },
  strength: { label: "force", delete: (name) => deleteStrength({ name }) },
  weakness: { label: "faiblesse", delete: (name) => deleteWeakness({ name }) },
  skill: {
    label: "compétence",
    delete: (name) => deleteCharacterSkill({ name }),
  },
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
      const type = CHARACTER_ATTRIBUTE_CONFIG[row.original.type]?.label ?? "";
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
            const value = await CHARACTER_ATTRIBUTE_CONFIG[r.type]?.delete(
              r.name,
            );
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
