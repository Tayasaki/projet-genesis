import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-2.5 py-8 text-center",
      className,
    )}
  >
    <div className="bg-muted flex size-9 items-center justify-center rounded-full">
      <Icon className="text-muted-foreground size-4" />
    </div>
    <div className="flex flex-col gap-0.5">
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </div>
  </div>
);
