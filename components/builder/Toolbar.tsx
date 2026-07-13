"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Braces,
  Code2,
  Download,
  ExternalLink,
  Hammer,
  Moon,
  Redo2,
  RotateCcw,
  Save,
  Settings2,
  Sun,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import type { ExportFormat } from "@/types";
import { useFormBuilder } from "@/hooks/useFormBuilder";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExportDialog } from "./ExportDialog";
import { FormSettingsDialog } from "./FormSettingsDialog";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle dark mode"
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
        >
          {mounted && resolvedTheme === "dark" ? <Sun /> : <Moon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Toggle dark mode</TooltipContent>
    </Tooltip>
  );
}

/** Top bar: logo, editable title, undo/redo, preview, export, save. */
export function Toolbar() {
  const {
    form,
    canUndo,
    canRedo,
    undo,
    redo,
    updateFormMeta,
    saveForm,
    resetForm,
    isDirty,
  } = useFormBuilder();

  const [title, setTitle] = useState(form.title);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportTab, setExportTab] = useState<ExportFormat>("json");
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => setTitle(form.title), [form.title]);

  const commitTitle = () => {
    const next = title.trim() || "Untitled form";
    setTitle(next);
    if (next !== form.title) updateFormMeta({ title: next });
  };

  const openExport = (tab: ExportFormat) => {
    setExportTab(tab);
    setExportOpen(true);
  };

  const handleSave = () => {
    saveForm();
    toast.success("Form saved");
  };

  const handlePreview = () => {
    saveForm();
    window.open(`/preview/${form.id}`, "_blank", "noopener");
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b-2 border-line bg-background px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 focus-hard"
          aria-label="FormForge home"
        >
          <span className="flex size-8 items-center justify-center border-2 border-ink bg-brand text-ink dark:border-line">
            <Hammer className="size-4" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight max-sm:hidden">
            Form<span className="text-crimson">Forge</span>
          </span>
        </Link>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          aria-label="Form title"
          className="h-9 w-full min-w-0 max-w-64 rounded-md border-2 border-transparent bg-transparent px-2 font-display text-sm font-bold text-foreground transition-colors focus-hard hover:border-line-soft"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={!canUndo}
              aria-label="Undo"
            >
              <Undo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={!canRedo}
              aria-label="Redo"
            >
              <Redo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
        </Tooltip>

        <span className="mx-1 h-6 w-0.5 bg-line-soft max-sm:hidden" aria-hidden />

        <ThemeToggle />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Form settings"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Form settings</TooltipContent>
        </Tooltip>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePreview}
          className="max-sm:hidden"
        >
          <ExternalLink />
          Preview
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="brand" size="sm">
              <Download />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export as</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => openExport("json")}>
              <Braces />
              JSON Schema
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openExport("react")}>
              <Code2 />
              React Component
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openExport("embed")}>
              <ExternalLink />
              Embed Code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                resetForm();
                toast.success("Form reset");
              }}
              className="text-crimson focus:bg-crimson focus:text-white"
            >
              <RotateCcw />
              Reset form
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" onClick={handleSave}>
          <Save />
          {isDirty ? "Save*" : "Save"}
        </Button>
      </div>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        initialTab={exportTab}
      />
      <FormSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
