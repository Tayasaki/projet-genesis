import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Loader } from "./loader";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 enabled:hover:scale-105 enabled:hover:ring-2 enabled:hover:ring-offset-2 enabled:active:scale-[1.02]  disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:ring-ring enabled:hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:scale-110 hover:bg-destructive/90 hover:ring-destructive",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:ring-ring",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:ring-0 hover:ring-offset-0",
        link: "text-primary underline-offset-4 hover:underline hover:ring-0 hover:ring-offset-0",
        discord:
          "bg-[#7289da] text-white hover:bg-[#677bc4] hover:ring-[#7289da]",
        github:
          "bg-[#24292e] text-white hover:bg-[#2f363d] hover:ring-[#24292e]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant,
      size,
      isLoading = false,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        disabled={isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {isLoading ? <Loader /> : children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
