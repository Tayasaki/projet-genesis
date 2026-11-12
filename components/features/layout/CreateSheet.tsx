"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";

export function CreateSheet({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm">
          <Plus />
          {label}
        </Button>
      </SheetTrigger>
      <SheetContent
        aria-describedby={undefined}
        className="w-full overflow-y-auto sm:max-w-xl"
      >
        <SheetHeader className="mb-6">
          <SheetTitle>{label}</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
