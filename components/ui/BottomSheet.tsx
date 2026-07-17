"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useDragControls,
  type PanInfo,
} from "framer-motion";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Snap heights in px, any order. Default [300, 600]. */
  snapPoints?: number[];
  /** Increment this counter to snap the sheet to its smallest height. */
  snapToMinSignal?: number;
}

const SPRING = { type: "spring", duration: 0.3, bounce: 0 } as const;

/**
 * Editorial bottom sheet: Paper background, hard top border, drag handle that
 * snaps between heights, backdrop tap + drag-down to close. Locks body scroll
 * while open and respects the bottom safe-area inset.
 */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [300, 600],
  snapToMinSignal,
}: BottomSheetProps) {
  const points = useMemo(
    () => [...snapPoints].sort((a, b) => a - b),
    [snapPoints],
  );
  const minSnap = points[0]!;
  const maxSnap = points[points.length - 1]!;
  const [snap, setSnap] = useState(maxSnap);
  const dragControls = useDragControls();

  useEffect(() => {
    if (isOpen) setSnap(maxSnap);
  }, [isOpen, maxSnap]);

  useEffect(() => {
    if (snapToMinSignal) setSnap(minSnap);
  }, [snapToMinSignal, minSnap]);

  // Lock body scroll while the sheet is open.
  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add("editor-open");
    return () => document.body.classList.remove("editor-open");
  }, [isOpen]);

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    const projected = snap - info.offset.y;
    // Dragged well below the lowest snap → close.
    if (projected < minSnap - 60) {
      onClose();
      return;
    }
    let nearest = points[0]!;
    for (const point of points) {
      if (Math.abs(point - projected) < Math.abs(nearest - projected)) {
        nearest = point;
      }
    }
    setSnap(nearest);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/40"
            aria-hidden
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%" }}
            animate={{ y: 0, height: snap }}
            exit={{ y: "100%" }}
            transition={SPRING}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.2 }}
            onDragEnd={handleDragEnd}
            style={{ height: snap }}
            className="fixed inset-x-0 bottom-0 z-50 flex w-full flex-col border-t-2 border-line bg-background pb-[env(safe-area-inset-bottom)]"
          >
            <div
              onPointerDown={(event) => dragControls.start(event)}
              className="shrink-0 cursor-grab touch-none select-none pt-3 active:cursor-grabbing"
            >
              <span
                className="mx-auto block h-1 w-9 bg-foreground/20"
                aria-hidden
              />
              <div className="flex items-center justify-between gap-2 py-1 pl-4 pr-2">
                <h2 className="min-w-0 truncate font-display text-base font-bold text-foreground">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex size-11 shrink-0 items-center justify-center text-foreground/60 transition-colors focus-hard hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
