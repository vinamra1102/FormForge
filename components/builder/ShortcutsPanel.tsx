"use client";

import { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";
import {
  SHORTCUT_CATEGORIES,
  TOGGLE_SHORTCUTS_EVENT,
  shortcuts,
} from "@/lib/shortcuts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function KeyBadge({ children }: { children: string }) {
  return (
    <kbd className="inline-flex min-w-7 items-center justify-center border-2 border-line bg-surface-muted px-1.5 py-0.5 font-mono text-xs font-semibold">
      {children}
    </kbd>
  );
}

/**
 * Linear-style keyboard shortcuts reference, grouped by category and driven
 * by the registry in lib/shortcuts.ts. Opens via `?` (dispatched by
 * useKeyboardShortcuts), the toolbar button, or the external open props.
 */
export function ShortcutsPanel({
  openExternal,
  onOpenExternalChange,
  showTrigger = true,
}: {
  openExternal?: boolean;
  onOpenExternalChange?: (open: boolean) => void;
  /** Render the keyboard-icon trigger button (off for externally-driven instances). */
  showTrigger?: boolean;
} = {}) {
  const [open, setOpen] = useState(false);

  const isOpen = openExternal !== undefined ? openExternal : open;
  const setIsOpen = (next: boolean) => {
    if (onOpenExternalChange) onOpenExternalChange(next);
    setOpen(next);
  };

  useEffect(() => {
    const toggle = () => setOpen((current) => !current);
    window.addEventListener(TOGGLE_SHORTCUTS_EVENT, toggle);
    return () => window.removeEventListener(TOGGLE_SHORTCUTS_EVENT, toggle);
  }, []);

  // Sync external open state
  useEffect(() => {
    if (openExternal !== undefined) setOpen(openExternal);
  }, [openExternal]);

  return (
    <>
      {showTrigger && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Keyboard shortcuts"
              onClick={() => setIsOpen(true)}
            >
              <Keyboard />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Keyboard shortcuts (?)</TooltipContent>
        </Tooltip>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>
              The whole builder works without a mouse.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto">
            {SHORTCUT_CATEGORIES.map((category) => {
              const entries = shortcuts.filter(
                (shortcut) => shortcut.category === category,
              );
              if (entries.length === 0) return null;
              return (
                <section
                  key={category}
                  className="border-b border-line/10 pb-3 last:border-b-0"
                >
                  <h3 className="mb-1.5 font-display text-[11px] font-bold uppercase tracking-widest text-foreground/50">
                    {category}
                  </h3>
                  <ul>
                    {entries.map((shortcut) => (
                      <li
                        key={shortcut.id}
                        className="flex items-center justify-between gap-4 py-1.5"
                      >
                        <span className="text-sm">{shortcut.description}</span>
                        <span className="flex items-center gap-1">
                          {shortcut.key.split("+").map((part) => (
                            <KeyBadge key={part}>{part}</KeyBadge>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>

          <p className="text-xs text-foreground/40">Press ? to close</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
