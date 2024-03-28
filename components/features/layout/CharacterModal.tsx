"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CharacterScenario } from "@/src/query/character.query";
import { AccordionContent } from "@radix-ui/react-accordion";
import { PenLine } from "lucide-react";
import Link from "next/link";
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
        <div className="flex items-center justify-center space-x-3">
          <Avatar>
            {character.image ? (
              <AvatarImage src={character.image} alt={"Image du personnage"} />
            ) : (
              <AvatarFallback>
                {character.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <h1 className="text-4xl font-bold">{character.name}</h1>
          <p className="text-lg">{character.pj ? "🧔" : "🤖"}</p>
          <Button variant={"outline"} onClick={() => router.refresh()}>
            <PenLine size={16} className="mr-2" />
            Editer
          </Button>
        </div>
        <div>
          {character.origin && <p>Origine: {character.origin}</p>}
          {character.role && <p>Rôle: {character.role}</p>}
          {character.age && <p>Âge: {character.age}</p>}
          {character.injury && (
            <p className="text-red-500">Blessure: {character.injury}</p>
          )}
          {character.extra && <p>Extra: {character.extra}</p>}
          {character.temperment ? (
            character.temperment?.description ? (
              <HoverCard>
                <HoverCardTrigger asChild className="hover:text-primary">
                  <p className="italic">
                    Temperement: {character.temperment?.name}
                  </p>
                </HoverCardTrigger>
                <HoverCardContent>
                  {character.temperment?.description}
                </HoverCardContent>
              </HoverCard>
            ) : (
              <p>Temperement: {character.temperment?.name}</p>
            )
          ) : null}
          {character.alignment ? (
            character.alignment?.description ? (
              <HoverCard>
                <HoverCardTrigger asChild className="hover:text-primary">
                  <p className="italic">
                    Alignement: {character.alignment?.name}
                  </p>
                </HoverCardTrigger>
                <HoverCardContent>
                  {character.alignment?.description}
                </HoverCardContent>
              </HoverCard>
            ) : (
              <p>Alignement: {character.alignment?.name}</p>
            )
          ) : null}
          {character.fortune ? (
            character.fortune?.description ? (
              <HoverCard>
                <HoverCardTrigger asChild className="hover:text-primary">
                  <p className="italic">Richesse: {character.fortune?.name}</p>
                </HoverCardTrigger>
                <HoverCardContent>
                  {character.fortune?.description}
                </HoverCardContent>
              </HoverCard>
            ) : (
              <p>Richesse: {character.fortune?.name}</p>
            )
          ) : null}
        </div>
        <Accordion type="multiple">
          <AccordionItem value="weapons">
            <AccordionTrigger>Armes</AccordionTrigger>
            <AccordionContent>
              <ul>
                {character.weapon.map((w) => (
                  <li key={w.id}>{w.name}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="skills">
            <AccordionTrigger>Compétences</AccordionTrigger>
            <AccordionContent>
              <ul>
                {character.skillSet.map((s) => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="strenghs">
            <AccordionTrigger>Forces</AccordionTrigger>
            <AccordionContent>
              <ul>
                {character.strength.map((s) => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="weaknesses">
            <AccordionTrigger>Faiblesses</AccordionTrigger>
            <AccordionContent>
              <ul>
                {character.weakness.map((w) => (
                  <li key={w.id}>{w.name}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
};
