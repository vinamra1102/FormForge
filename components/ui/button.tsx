import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border-2 font-display text-sm font-bold transition-colors focus-hard disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "border-ink bg-crimson text-white hover:bg-crimson-deep dark:border-line",
        brand:
          "border-ink bg-brand text-ink hover:bg-brand-soft dark:border-line",
        outline:
          "border-line bg-transparent text-foreground hover:border-crimson hover:bg-brand hover:text-ink",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-surface-muted",
        destructive:
          "border-crimson bg-transparent text-crimson hover:bg-crimson hover:text-white",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "size-9",
        iconSm: "size-7",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
