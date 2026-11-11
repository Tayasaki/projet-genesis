"use client";

import { DeleteDialog } from "@/components/features/layout/DeleteDialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "../manage/data-table";
import { type ActionErrorFields, hasActionError } from "@/lib/action-result";
import { createAlignment } from "@/src/actions/character/alignment.action";
import { createCharacterSkill } from "@/src/actions/character/characterSkill.action";
import { createFortune } from "@/src/actions/character/fortune.action";
import { createStrength } from "@/src/actions/character/strength.action";
import { createTemperment } from "@/src/actions/character/temperment.action";
import { createWeakness } from "@/src/actions/character/weakness.action";
import { deleteSuggestion } from "@/src/actions/suggestion.action";
import { createAmmo } from "@/src/actions/weapon/ammo.action";
import { createDamage } from "@/src/actions/weapon/damage.action";
import { createRange } from "@/src/actions/weapon/range.action";
import { createWeaponSkill } from "@/src/actions/weapon/weaponSkill.action";
import { createWeight } from "@/src/actions/weapon/weight.action";
import { Suggestion } from "@/src/query/suggestion.query";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

/** Creates the catalog entry for a suggestion; the caller checks the result. */
function createCatalogEntry({
  type,
  name,
  description,
}: Suggestion): Promise<ActionErrorFields | undefined> {
  const withDescription = { name, description: description ?? undefined };
  switch (type) {
    case "Alignment":
      return createAlignment(withDescription);
    case "Ammo":
      return createAmmo({ name });
    case "CharacterSkill":
      return createCharacterSkill({ name });
    case "Damage":
      return createDamage({ name });
    case "Fortune":
      return createFortune(withDescription);
    case "Range":
      return createRange({ name });
    case "Strength":
      return createStrength({ name });
    case "Temperment":
      return createTemperment(withDescription);
    case "Weakness":
      return createWeakness({ name });
    case "WeaponSkill":
      return createWeaponSkill({ name });
    case "Weight":
      return createWeight({ name });
  }
}

function AcceptButton({ suggestion }: { suggestion: Suggestion }) {
  const t = useTranslations("suggestions");
  const [pending, setPending] = useState(false);

  async function accept() {
    setPending(true);
    try {
      const created = await createCatalogEntry(suggestion);
      if (hasActionError(created)) {
        toast.error(t("createError"));
        return;
      }
      const deleted = await deleteSuggestion({ name: suggestion.name });
      if (hasActionError(deleted)) {
        toast.error(t("createdButNotDeleted"));
        return;
      }
      toast.success(t("accepted"));
    } catch {
      toast.error(t("unknownError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <Button onClick={accept} disabled={pending}>
      {t("accept")}
    </Button>
  );
}

function useSuggestionsColumns(): ColumnDef<Suggestion>[] {
  const t = useTranslations("suggestions");
  const tCommon = useTranslations("common");

  return [
    {
      accessorKey: "type",
      header: tCommon("type"),
    },
    {
      accessorKey: "name",
      header: tCommon("name"),
    },
    {
      accessorKey: "description",
      header: tCommon("description"),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-2">
            <AcceptButton suggestion={row.original} />
            <DeleteDialog
              item={row.original.name}
              deleteItem={async () => {
                try {
                  const deleted = await deleteSuggestion({
                    name: row.original.name,
                  });
                  if (hasActionError(deleted)) {
                    toast.error(t("deleteError"));
                    return;
                  }
                  toast.success(t("deletedSuccess", { name: row.original.name }));
                } catch {
                  toast.error(t("unknownError"));
                }
              }}
            />
          </div>
        );
      },
    },
  ];
}

export function SuggestionsTable({ data }: { data: Suggestion[] }) {
  const t = useTranslations("suggestions");
  const columns = useSuggestionsColumns();
  return <DataTable columns={columns} data={data} title={t("heading")} />;
}
