"use client";

import { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";
import { isEditableTarget } from "@/hooks/useUndo";
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

const SHORTCUTS: { keys: string[]; action: string }[] = [
  { keys: ["Ctrl", "Z"], action: "Undo" },
  { keys: ["Ctrl", "Shift", "Z"], action: "Redo" },
  { keys: ["Ctrl", "Y"], action: "Redo (alternative)" },
  { keys: ["Enter"], action: "Edit the focused field" },
  { keys: ["Delete"], action: "Remove the focused field" },
  { keys: ["↑", "↓"], action: "Reorder the focused field" },
  { keys: ["Tab"], action: "Move between fields and controls" },
  { keys: ["Esc"], action: "Close dialogs and menus" },
  { keys: ["?"], action: "Open this panel" },
];

function Key({ children }: { children: string }) {
  return (
    <kbd className="inline-flex min-w-7 items-center justify-center border-2 border-line bg-surface-muted px-1.5 py-0.5 font-mono text-xs font-semibold">
      {children}
    </kbd>
  );
}

/** Keyboard shortcuts reference — opens with `?` or the toolbar button. */
export function ShortcutsDialog({
  openExternal,
  onOpenExternalChange,
}: {
  openExternal?: boolean;
  onOpenExternalChange?: (open: boolean) => void;
} = {}) {
  const [open, setOpen] = useState(false);

  const isOpen = openExternal !== undefined ? openExternal : open;
  const setIsOpen = (next: boolean) => {
    if (onOpenExternalChange) onOpenExternalChange(next);
    setOpen(next);
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "?" && !isEditableTarget(event.target)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Sync external open state
  useEffect(() => {
    if (openExternal !== undefined) setOpen(openExternal);
  }, [openExternal]);

  return (
    <>
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>
              The whole builder works without a mouse.
            </DialogDescription>
          </DialogHeader>
          <ul className="divide-y-2 divide-line-soft border-2 border-line">
            {SHORTCUTS.map((shortcut) => (
              <li
                key={shortcut.action}
                className="flex items-center justify-between gap-4 bg-surface px-3 py-2"
              >
                <span className="text-sm">{shortcut.action}</span>
                <span className="flex items-center gap-1">
                  {shortcut.keys.map((key) => (
                    <Key key={key}>{key}</Key>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
