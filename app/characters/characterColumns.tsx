"use client";

import { DeleteDialog } from "@/components/features/layout/DeleteDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable } from "../manage/data-table";
import { deleteCharacter } from "@/src/actions/character/character.action";
import { Character } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, PenLine } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";

function useCharacterColumns(): ColumnDef<Character>[] {
  const t = useTranslations("myCharacters");
  const tCommon = useTranslations("common");

  return [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {tCommon("name")} <ArrowUpDown className="ml-2 size-4" />
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
            {t("pj")} <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return row.original.pj ? "🧔" : "🤖";
      },
    },
    {
      accessorKey: "role",
      header: t("role"),
      cell: ({ row }) => {
        return row.original.role === "" || row.original.role === null
          ? t("noRole")
          : row.original.role;
      },
    },
    {
      accessorKey: "origin",
      header: t("origin"),
      cell: ({ row }) => {
        return row.original.origin === "" || row.original.origin === null
          ? t("noOrigin")
          : row.original.origin;
      },
    },
    {
      id: "actions",
      header: tCommon("actions"),
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-4">
            <Link
              className={buttonVariants({ variant: "outline", size: "sm" })}
              href={`/characters/${row.original.id}`}
            >
              <PenLine size={16} className="mr-2" />
              {t("edit")}
            </Link>
            <DeleteDialog
              item={row.original.name}
              deleteItem={async () => {
                await deleteCharacter({ id: row.original.id });
                toast.success(t("deletedSuccess", { name: row.original.name }));
              }}
            />
          </div>
        );
      },
    },
  ];
}

export function MyCharactersTable({ data }: { data: Character[] }) {
  const t = useTranslations("myCharacters");
  const columns = useCharacterColumns();
  return <DataTable columns={columns} data={data} title={t("heading")} />;
}
