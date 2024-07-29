"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CharacterScenario } from "@/src/query/character.query";
import { useState } from "react";
import { Character } from "./Character";

export const DisplayCharacter = ({
  characterList,
}: {
  characterList: CharacterScenario[];
}) => {
  const [character, setCharacter] =
    useState<CharacterScenario[]>(characterList);
  const [displayArgument, setDisplayArgument] = useState<{
    search: string;
    sort: "name" | "pj" | "";
  }>({
    search: "",
    sort: "",
  });

  const filterCharacter = () => {
    let list = characterList;
    if (displayArgument.search) {
      list = characterList.filter((c) =>
        c.name
          .toLocaleLowerCase()
          .includes(displayArgument.search.toLocaleLowerCase()),
      );
    }
    list.sort((a, b) => {
      if (displayArgument.sort === "name") {
        return a.name.localeCompare(b.name);
      } else if (displayArgument.sort === "pj") {
        return Number(a.pj) - Number(b.pj);
      }
      return 0;
    });
    return list;
  };

  return (
    <div>
      <div className="mb-8 flex items-center gap-2">
        <Input
          placeholder="Nom du personnage..."
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
          <SelectTrigger>
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nom</SelectItem>
            <SelectItem value="pj">PJ</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator orientation="horizontal" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filterCharacter().map((c) => (
          <div key={c.id}>
            <Character character={c} />
          </div>
        ))}
      </div>
    </div>
  );
};
