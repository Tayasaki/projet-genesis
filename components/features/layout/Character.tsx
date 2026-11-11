"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CharacterScenario } from "@/src/query/character.query";
import { useTranslations } from "next-intl";
import Link from "next/link";

export const Character = ({ character }: { character: CharacterScenario }) => {
  const t = useTranslations("characterCard");
  return (
    <Card className="hover:border-primary/40 max-w-md transition-colors">
      <Link href={`/characters/${character.id}`}>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <Avatar>
            {character.image ? (
              <AvatarImage src={character.image} alt={t("imageAlt")} />
            ) : (
              <AvatarFallback>
                {character.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <CardTitle className="text-base font-semibold">
            {character.name}
          </CardTitle>
          <Badge variant="outline">
            {character.pj ? t("pj") : t("npc")}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {character.origin && <p>{t("origin", { origin: character.origin })}</p>}
          {character.role && <p>{t("role", { role: character.role })}</p>}
          {character.age && <p>{t("age", { age: character.age })}</p>}
          {character.injury && (
            <p className="text-red-500">
              {t("injury", { injury: character.injury })}
            </p>
          )}
          {character.temperment ? (
            character.temperment?.description ? (
              <HoverCard>
                <HoverCardTrigger asChild className="hover:text-primary">
                  <p className="decoration-muted-foreground underline decoration-dotted underline-offset-4">
                    {t("temperment", { name: character.temperment?.name })}
                  </p>
                </HoverCardTrigger>
                <HoverCardContent>
                  {character.temperment?.description}
                </HoverCardContent>
              </HoverCard>
            ) : (
              <p>{t("temperment", { name: character.temperment?.name })}</p>
            )
          ) : null}
          {character.alignment ? (
            character.alignment?.description ? (
              <HoverCard>
                <HoverCardTrigger asChild className="hover:text-primary">
                  <p className="decoration-muted-foreground underline decoration-dotted underline-offset-4">
                    {t("alignment", { name: character.alignment?.name })}
                  </p>
                </HoverCardTrigger>
                <HoverCardContent>
                  {character.alignment?.description}
                </HoverCardContent>
              </HoverCard>
            ) : (
              <p>{t("alignment", { name: character.alignment?.name })}</p>
            )
          ) : null}
          {character.fortune ? (
            character.fortune?.description ? (
              <HoverCard>
                <HoverCardTrigger asChild className="hover:text-primary">
                  <p className="decoration-muted-foreground underline decoration-dotted underline-offset-4">
                    {t("fortune", { name: character.fortune?.name })}
                  </p>
                </HoverCardTrigger>
                <HoverCardContent>
                  {character.fortune?.description}
                </HoverCardContent>
              </HoverCard>
            ) : (
              <p>{t("fortune", { name: character.fortune?.name })}</p>
            )
          ) : null}
        </CardContent>
      </Link>
    </Card>
  );
};
