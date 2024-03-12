"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CharacterScenario } from "@/src/query/character.query";
import { usePathname, useRouter } from "next/navigation";

export const CharacterModal = ({
  character,
}: {
  character: CharacterScenario;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Dialog
      open={pathname === `/characters/${character.id}`}
      onOpenChange={() => router.back()}
    >
      <DialogContent>
        <>
          <h1 className="text-4xl font-bold">{character.name}</h1>
          <p>{character.pj ? "🧔" : "🤖"}</p>
          <p>{character.age} ans</p>
          <p>{character.image ?? "Pas d'image"}</p>
          <p>{character.origin}</p>
          <p>{character.role}</p>
          <p className="text-red-500">{character.injury}</p>
          <p>{character.extra}</p>
          <p>{character.temperment?.name}</p>
          <p>{character.alignment?.name}</p>
          <p>{character.fortune?.name}</p>
          <div>
            {character.skillSet.length > 0 && (
              <>
                <h3 className="text-2xl font-semibold">Compétences</h3>
                <ul>
                  {character.skillSet.map((s) => (
                    <li className="italic" key={s.id}>
                      {s.name}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div>
            {character.strength.length > 0 && (
              <>
                <h3 className="text-2xl font-semibold">Forces</h3>
                <ul>
                  {character.strength.map((s) => (
                    <li className="italic" key={s.id}>
                      {s.name}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div>
            {character.weakness.length > 0 && (
              <>
                <h3 className="text-2xl font-semibold">Faiblesses</h3>
                <ul>
                  {character.weakness.map((w) => (
                    <li className="italic" key={w.id}>
                      {w.name}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      </DialogContent>
    </Dialog>
  );
};
