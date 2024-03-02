import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CharacterScenario } from "@/src/features/query/character.query";
import Link from "next/link";
export const Character = ({ character }: { character: CharacterScenario }) => {
  return (
    <Card className="max-w-xs flex-1 hover:ring-2 hover:ring-offset-2">
      <Link href={`/personnages/${character.id}`}>
        <CardHeader className="flex flex-row">
          <Avatar>
            {character.image ? (
              <AvatarImage src={character.image} alt={"Image du personnage"} />
            ) : (
              <AvatarFallback>{character.name[0]}</AvatarFallback>
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
          {character.temperment?.name}
          {character.alignment?.name}
          {character.fortune?.name}
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
