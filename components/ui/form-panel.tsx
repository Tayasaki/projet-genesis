import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

export const FormPanel = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) => (
  <div
    className={cn(
      "border-border bg-card rounded-xl border p-6",
      className,
    )}
    {...props}
  />
);
