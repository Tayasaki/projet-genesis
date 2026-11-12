"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CharacterScenario } from "@/src/query/character.query";
import { Cake, HeartCrack, MapPin, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

type Trait = { name: string; description?: string | null } | null | undefined;

const TraitBadge = ({ trait, title }: { trait: Trait; title: string }) => {
  if (!trait) return null;
  const badge = (
    <Badge variant="outline" title={title} className="font-normal">
      {trait.name}
    </Badge>
  );
  if (!trait.description) return badge;
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{badge}</HoverCardTrigger>
      <HoverCardContent>{trait.description}</HoverCardContent>
    </HoverCard>
  );
};

const Section = ({
  title,
  items,
}: {
  title: string;
  items: { id: string; name: string }[];
}) =>
  items.length === 0 ? null : (
    <section className="flex flex-col gap-2">
      <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((i) => (
          <Badge key={i.id} variant="secondary" className="font-normal">
            {i.name}
          </Badge>
        ))}
      </div>
    </section>
  );

export const CharacterDetails = ({
  character,
  titleAs: Title = "h2",
}: {
  character: CharacterScenario;
  titleAs?: React.ElementType;
}) => {
  const t = useTranslations("characterCard");
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          {character.image ? (
            <AvatarImage src={character.image} alt={t("imageAlt")} />
          ) : (
            <AvatarFallback>
              {character.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Title className="text-xl font-semibold tracking-tight">
              {character.name}
            </Title>
            <Badge variant={character.pj ? "default" : "secondary"}>
              {character.pj ? t("pj") : t("npc")}
            </Badge>
          </div>
          {character.role && (
            <span className="text-muted-foreground text-sm">
              {character.role}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 text-sm">
        {character.origin && (
          <p className="text-muted-foreground flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            {character.origin}
          </p>
        )}
        {character.age && (
          <p className="text-muted-foreground flex items-center gap-1.5">
            <Cake className="size-3.5 shrink-0" />
            {t("age", { age: character.age })}
          </p>
        )}
        {character.injury && (
          <p className="text-destructive flex items-center gap-1.5">
            <HeartCrack className="size-3.5 shrink-0" />
            {character.injury}
          </p>
        )}
        {character.extra && (
          <p className="text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="size-3.5 shrink-0" />
            {character.extra}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <TraitBadge
          trait={character.temperment}
          title={t("temperment", { name: character.temperment?.name ?? "" })}
        />
        <TraitBadge
          trait={character.alignment}
          title={t("alignment", { name: character.alignment?.name ?? "" })}
        />
        <TraitBadge
          trait={character.fortune}
          title={t("fortune", { name: character.fortune?.name ?? "" })}
        />
      </div>

      <Section title={t("weapons")} items={character.weapon} />
      <Section title={t("skills")} items={character.skillSet} />
      <Section title={t("strengths")} items={character.strength} />
      <Section title={t("weaknesses")} items={character.weakness} />
    </div>
  );
};
