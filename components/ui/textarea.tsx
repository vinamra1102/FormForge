import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full rounded-md border-2 border-line bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-foreground/40 focus-hard disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-crimson",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
