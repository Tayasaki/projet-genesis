"use client";

import { DeleteDialog } from "@/components/features/layout/DeleteDialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { hasActionError } from "@/lib/action-result";
import { deleteAlignment } from "@/src/actions/character/alignment.action";
import { deleteCharacterSkill } from "@/src/actions/character/characterSkill.action";
import { deleteFortune } from "@/src/actions/character/fortune.action";
import { deleteStrength } from "@/src/actions/character/strength.action";
import { deleteTemperment } from "@/src/actions/character/temperment.action";
import { deleteWeakness } from "@/src/actions/character/weakness.action";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { CharacterAttributes } from "./page";
import { toast } from "sonner";

// One entry per attribute type, holding both its translation key and delete action.
const CHARACTER_ATTRIBUTE_CONFIG: Record<
  string,
  {
    labelKey:
      | "temperament"
      | "alignment"
      | "fortune"
      | "strength"
      | "weakness"
      | "skill";
    delete: (name: string) => Promise<{ serverError?: unknown } | void>;
  }
> = {
  temperment: {
    labelKey: "temperament",
    delete: (name) => deleteTemperment({ name }),
  },
  alignement: {
    labelKey: "alignment",
    delete: (name) => deleteAlignment({ name }),
  },
  fortune: { labelKey: "fortune", delete: (name) => deleteFortune({ name }) },
  strength: {
    labelKey: "strength",
    delete: (name) => deleteStrength({ name }),
  },
  weakness: {
    labelKey: "weakness",
    delete: (name) => deleteWeakness({ name }),
  },
  skill: {
    labelKey: "skill",
    delete: (name) => deleteCharacterSkill({ name }),
  },
};

function useCharacterAttributesColumns(): ColumnDef<CharacterAttributes>[] {
  const t = useTranslations("common");
  const tManage = useTranslations("manage");

  return [
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("type")} <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const labelKey =
          CHARACTER_ATTRIBUTE_CONFIG[row.original.type]?.labelKey;
        return (
          <span className="capitalize">
            {labelKey ? tManage(labelKey) : ""}
          </span>
        );
      },
    },
    {
      accessorKey: "name",
      header: t("name"),
    },
    {
      accessorKey: "description",
      header: t("description"),
      cell: ({ row }) => {
        const r = row.original;
        return (
          <span className={!r.description ? "italic" : ""}>
            {r.description ?? t("noDescription")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => {
        const r = row.original;

        return (
          <DeleteDialog
            item={row.original.name}
            deleteItem={async () => {
              const value = await CHARACTER_ATTRIBUTE_CONFIG[r.type]?.delete(
                r.name,
              );
              if (hasActionError(value)) {
                toast.error(t("notAuthorizedDeleteAttribute"));
              }
            }}
          />
        );
      },
    },
  ];
}

export function CharacterAttributesTable({
  data,
  title,
  actions,
}: {
  data: CharacterAttributes[];
  title: string;
  actions?: React.ReactNode;
}) {
  const columns = useCharacterAttributesColumns();
  return (
    <DataTable columns={columns} data={data} title={title} actions={actions} />
  );
}
