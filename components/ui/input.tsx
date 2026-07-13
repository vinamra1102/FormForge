import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full rounded-md border-2 border-line bg-surface px-3 text-sm text-foreground transition-colors placeholder:text-foreground/40 focus-hard disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-crimson",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
