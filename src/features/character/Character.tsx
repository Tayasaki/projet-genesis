import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CharacterScenario } from "@/src/features/query/character.query";
import Link from "next/link";
export const Character = ({ character }: { character: CharacterScenario }) => {
  return (
    <Link href={`/personnages/${character.id}`}>
      <Card className="max-w-xs flex-1 hover:bg-gray-200 dark:hover:bg-gray-800">
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
        <CardDescription className="container">
          {character.origin}
          {character.role}
          {character.age}
          {character.injury}
          {character.extra}
          {character.temperment?.name}
        </CardDescription>
      </Card>
    </Link>
  );
};
