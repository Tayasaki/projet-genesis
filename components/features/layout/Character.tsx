"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CharacterScenario } from "@/src/query/character.query";
import Link from "next/link";

export const Character = ({ character }: { character: CharacterScenario }) => {
  return (
    <Card className="max-w-md transition hover:scale-110 hover:ring-2 hover:ring-ring hover:ring-offset-2 active:scale-105">
      <Link href={`/characters/${character.id}`}>
        <CardHeader className="flex flex-row">
          <Avatar>
            {character.image ? (
              <AvatarImage src={character.image} alt={"Image du personnage"} />
            ) : (
              <AvatarFallback>
                {character.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <CardTitle>{character.name}</CardTitle>
          {character.pj ? "🧔" : "🤖"}
        </CardHeader>
        <div className="container">
          {character.origin && <p>Origine: {character.origin}</p>}
          {character.role && <p>Rôle: {character.role}</p>}
          {character.age && <p>Âge: {character.age}</p>}
          {character.injury && <p>Blessure: {character.injury}</p>}
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
      </Link>
    </Card>
  );
};
