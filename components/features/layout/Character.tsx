"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CharacterScenario } from "@/src/query/character.query";
import { Cake, HeartCrack, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

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

export const Character = ({
  character,
  actions,
}: {
  character: CharacterScenario;
  actions?: React.ReactNode;
}) => {
  const t = useTranslations("characterCard");
  return (
    <div className="bg-card hover:border-primary/40 focus-within:border-primary/40 relative flex h-full flex-col gap-4 rounded-xl border p-5 transition-colors">
      {actions && <div className="absolute top-3 right-3 z-10">{actions}</div>}
      <div className="flex items-start gap-3">
        <Avatar className="size-11">
          {character.image ? (
            <AvatarImage src={character.image} alt={t("imageAlt")} />
          ) : (
            <AvatarFallback>
              {character.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <Link
            href={`/characters/${character.id}`}
            className="text-base leading-tight font-semibold after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {character.name}
          </Link>
          <span className="text-muted-foreground truncate text-sm">
            {character.role || "\u00a0"}
          </span>
        </div>
      </div>

      {(character.origin || character.age || character.injury) && (
        <div className="flex flex-col gap-1.5 text-sm">
          {character.origin && (
            <p className="text-muted-foreground flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{character.origin}</span>
            </p>
          )}
          {character.age && (
            <p className="text-muted-foreground flex items-center gap-1.5">
              <Cake className="size-3.5 shrink-0" />
              <span>{t("age", { age: character.age })}</span>
            </p>
          )}
          {character.injury && (
            <p className="text-destructive flex items-center gap-1.5">
              <HeartCrack className="size-3.5 shrink-0" />
              <span className="truncate">{character.injury}</span>
            </p>
          )}
        </div>
      )}

      <div className="relative z-10 mt-auto flex flex-wrap gap-1.5">
        <Badge variant={character.pj ? "default" : "secondary"}>
          {character.pj ? t("pj") : t("npc")}
        </Badge>
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
    </div>
  );
};
