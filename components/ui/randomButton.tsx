"use client";

import { Dices } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "./button";

export const RandomButton = ({ randomize }: { randomize: () => void }) => {
  const t = useTranslations("common");
  return (
    <Button
      className="group"
      size={"sm"}
      type="button"
      aria-label={t("randomize")}
      onClick={randomize}
    >
      <Dices className="group-hover:animate-shake" />
    </Button>
  );
};
