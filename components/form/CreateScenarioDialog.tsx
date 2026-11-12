"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ScenarioForm } from "./ScenarioForm";

export const CreateScenarioDialog = () => {
  const t = useTranslations("home");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          {t("createScenario")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createScenario")}</DialogTitle>
        </DialogHeader>
        <ScenarioForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
