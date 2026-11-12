"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CharacterScenario } from "@/src/query/character.query";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Character } from "./Character";

export const DisplayCharacter = ({
  characterList,
  renderActions,
}: {
  characterList: CharacterScenario[];
  renderActions?: (character: CharacterScenario) => React.ReactNode;
}) => {
  const t = useTranslations("characterCard");
  const [displayArgument, setDisplayArgument] = useState<{
    search: string;
    sort: "name" | "pj" | "";
  }>({
    search: "",
    sort: "",
  });

  const filteredCharacters = useMemo(() => {
    let list = displayArgument.search
      ? characterList.filter((c) =>
          c.name
            .toLocaleLowerCase()
            .includes(displayArgument.search.toLocaleLowerCase()),
        )
      : [...characterList];
    list.sort((a, b) => {
      if (displayArgument.sort === "name") return a.name.localeCompare(b.name);
      if (displayArgument.sort === "pj") return Number(a.pj) - Number(b.pj);
      return 0;
    });
    return list;
  }, [characterList, displayArgument.search, displayArgument.sort]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Input
          className="flex-1"
          placeholder={t("searchPlaceholder")}
          onChange={(e) =>
            setDisplayArgument((prev) => ({
              ...prev,
              search: e.target.value,
            }))
          }
        />
        <Select
          defaultValue={displayArgument.sort}
          onValueChange={(v: "name" | "pj") =>
            setDisplayArgument((prev) => ({
              ...prev,
              sort: v,
            }))
          }
        >
          <SelectTrigger className="w-44 shrink-0">
            <SelectValue placeholder={t("sortByPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">{t("sortByName")}</SelectItem>
            <SelectItem value="pj">{t("sortByPj")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCharacters.map((c) => (
          <Character key={c.id} character={c} actions={renderActions?.(c)} />
        ))}
      </div>
    </div>
  );
};
