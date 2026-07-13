"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useBuilderStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shown when the canvas has no fields yet. */
export function EmptyState({ isOver = false }: { isOver?: boolean }) {
  const addField = useBuilderStore((s) => s.addField);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center gap-5 border-2 border-dashed px-6 py-14 text-center transition-colors",
        isOver ? "border-crimson bg-brand/30" : "border-line-soft",
      )}
    >
      <Image
        src="/illustrations/empty-canvas.png"
        alt="A friendly robot pointing at an empty form canvas"
        width={280}
        height={280}
        priority
        className="h-auto w-56 sm:w-64"
      />
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Drag a field to get started
        </h2>
        <p className="max-w-sm text-sm text-foreground/60">
          Grab any field from the palette and drop it here — or click one to
          add it instantly.
        </p>
      </div>
      <Button variant="brand" onClick={() => addField("text")}>
        <Plus />
        Add a text field
      </Button>
    </motion.div>
  );
}
