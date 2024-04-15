import { cn } from "@/lib/utils";
import React, { ComponentPropsWithoutRef } from "react";

export const Code = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) => {
  return (
    <span
      className={cn(
        "pointer-events-none inline-flex items-center rounded-sm border border-accent bg-accent/30 p-1 font-mono font-bold text-primary transition-colors hover:bg-accent/50",
        className,
      )}
      {...props}
    />
  );
};
