"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CharacterScenario } from "@/src/query/character.query";
import { AccordionContent } from "@radix-ui/react-accordion";
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
          <div className="flex items-center justify-center space-x-3">
            <Avatar>
              {character.image ? (
                <AvatarImage
                  src={character.image}
                  alt={"Image du personnage"}
                />
              ) : (
                <AvatarFallback>
                  {character.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <h1 className="text-4xl font-bold">{character.name}</h1>
            <p className="text-lg">{character.pj ? "🧔" : "🤖"}</p>
          </div>

          <p>{character.age} ans</p>
          <p>{character.origin}</p>
          <p>{character.role}</p>
          <p className="text-red-500">{character.injury}</p>
          <p>{character.extra}</p>
          <div className="flex flex-col">
            {character.temperment?.description ? (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <p className="underline">{character.temperment?.name}</p>
                </HoverCardTrigger>
                <HoverCardContent>
                  {character.temperment?.description}
                </HoverCardContent>
              </HoverCard>
            ) : (
              <p>{character.temperment?.name}</p>
            )}
            {character.alignment?.description ? (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <p className="underline">{character.alignment?.name}</p>
                </HoverCardTrigger>
                <HoverCardContent>
                  {character.alignment?.description}
                </HoverCardContent>
              </HoverCard>
            ) : (
              <p>{character.alignment?.name}</p>
            )}
            {character.fortune?.description ? (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <p className="underline">{character.fortune?.name}</p>
                </HoverCardTrigger>
                <HoverCardContent>
                  {character.fortune?.description}
                </HoverCardContent>
              </HoverCard>
            ) : (
              <p>{character.fortune?.name}</p>
            )}
          </div>
          <Accordion type="multiple">
            <AccordionItem value="weapon">
              <AccordionTrigger>Armes</AccordionTrigger>
              <AccordionContent>
                <ul>
                  {character.weapon?.map((w) => <li key={w.id}>{w.name}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
