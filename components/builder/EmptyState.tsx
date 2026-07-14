"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useBuilderStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function useIsCoarsePointer() {
  const [isCoarse, setIsCoarse] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(pointer: coarse)");
    setIsCoarse(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsCoarse(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isCoarse;
}

/** Shown when the canvas has no fields yet. */
export function EmptyState({ isOver = false }: { isOver?: boolean }) {
  const addField = useBuilderStore((s) => s.addField);
  const isCoarse = useIsCoarsePointer();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center gap-4 border-2 border-dashed px-6 py-10 text-center transition-colors sm:py-14",
        isOver ? "border-crimson bg-brand/30" : "border-line-soft",
      )}
    >
      <Image
        src="/illustrations/empty-canvas.png"
        alt="A friendly robot pointing at an empty form canvas"
        width={280}
        height={280}
        priority
        className="h-auto max-h-[180px] w-auto sm:max-h-[240px]"
      />
      <div className="space-y-1.5">
        <h2 className="font-display text-[22px] font-bold text-foreground sm:text-[28px]">
          {isCoarse ? "Tap a field above to add it" : "Drag a field to get started"}
        </h2>
        <p className="max-w-sm text-sm text-[#6B7280]">
          {isCoarse
            ? "Pick any field from the palette above to add it to your form."
            : "Grab any field from the palette and drop it here — or click one to add it instantly."}
        </p>
      </div>
      <Button variant="brand" onClick={() => addField("text")}>
        <Plus />
        Add a text field
      </Button>
    </motion.div>
  );
}
