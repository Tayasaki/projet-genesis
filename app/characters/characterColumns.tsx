"use client";

import { DeleteDialog } from "@/components/features/layout/DeleteDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { deleteCharacter } from "@/src/actions/character/character.action";
import { Character } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, PenLine } from "lucide-react";
import Link from "next/link";

export const columns: ColumnDef<Character>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nom <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "pj",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          PJ <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return row.original.pj ? "🧔" : "🤖";
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      return row.original.role ?? "Pas de role";
    },
  },
  {
    accessorKey: "origin",
    header: "Origine",
    cell: ({ row }) => {
      return row.original.origin ?? "Pas d'origine";
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-4">
          <Link
            className={buttonVariants({ variant: "outline", size: "sm" })}
            href={`/characters/${row.original.id}`}
          >
            <PenLine size={16} className="mr-2" />
            Editer
          </Link>
          <DeleteDialog
            item={row.original.name}
            deleteItem={async () => deleteCharacter({ id: row.original.id })}
          />
        </div>
      );
    },
  },
];
