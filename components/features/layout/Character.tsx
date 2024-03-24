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
          {character.origin}
          {character.role}
          {character.age}
          {character.injury}
          {character.extra}
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
            character.temperment?.name
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
            character.alignment?.name
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
            character.fortune?.name
          )}
          {character.strength.length > 0 && (
            <ul>
              {character.strength.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          )}
          {character.weakness.length > 0 && (
            <ul>
              {character.weakness.map((w) => (
                <li key={w.id}>{w.name}</li>
              ))}
            </ul>
          )}
          {character.skillSet.length > 0 && (
            <ul>
              {character.skillSet.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          )}
        </div>
      </Link>
    </Card>
  );
};
