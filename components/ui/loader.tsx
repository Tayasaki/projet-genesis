import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const Loader = ({
  size,
  className,
}: {
  size?: number;
  className?: string;
}) => {
  return <Loader2 className={cn("animate-spin", className)} size={size} />;
};
