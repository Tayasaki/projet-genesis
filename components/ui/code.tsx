import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

export const Code = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) => {
  return (
    <span
      className={cn(
        "border-accent bg-accent/30 text-primary hover:bg-accent/50 pointer-events-none inline-flex items-center rounded-sm border p-1 font-mono font-bold transition-colors",
        className,
      )}
      {...props}
    />
  );
};
