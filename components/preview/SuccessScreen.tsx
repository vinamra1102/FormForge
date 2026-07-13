"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

/** Animated checkmark + the form's configured success message. */
export function SuccessScreen({
  message,
  onReset,
}: {
  message: string;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 border-2 border-line bg-surface px-6 py-14 text-center"
      role="status"
    >
      <motion.svg
        viewBox="0 0 72 72"
        className="size-24"
        aria-hidden
        initial="hidden"
        animate="visible"
      >
        <motion.circle
          cx="36"
          cy="36"
          r="32"
          fill="var(--color-brand)"
          stroke="var(--color-ink)"
          strokeWidth="3"
          variants={{
            hidden: { scale: 0 },
            visible: {
              scale: 1,
              transition: { type: "spring", stiffness: 260, damping: 18 },
            },
          }}
        />
        <motion.path
          d="M22 37 L32 47 L51 27"
          fill="none"
          stroke="var(--color-crimson)"
          strokeWidth="6"
          strokeLinecap="square"
          variants={{
            hidden: { pathLength: 0 },
            visible: {
              pathLength: 1,
              transition: { delay: 0.25, duration: 0.4, ease: "easeOut" },
            },
          }}
        />
      </motion.svg>

      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {message || "Thanks! Your response has been recorded."}
        </h2>
        <p className="text-sm text-foreground/60">
          This is a live preview — nothing was actually submitted.
        </p>
      </div>

      <Button variant="outline" onClick={onReset}>
        Submit another response
      </Button>
    </motion.div>
  );
}
