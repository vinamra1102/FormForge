"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Braces,
  Code2,
  Download,
  ExternalLink,
  FileText,
  Hammer,
  Keyboard,
  Loader2,
  MoreHorizontal,
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
import { toEmbedCode, toJSONSchema, toReactCode } from "@/lib/export";
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
import { ShortcutsDialog } from "./ShortcutsDialog";

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

function ThemeToggleDropdownItem() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <DropdownMenuItem
      onSelect={() =>
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      }
    >
      {mounted && resolvedTheme === "dark" ? <Sun /> : <Moon />}
      Toggle dark mode
    </DropdownMenuItem>
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
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

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

  const COPY_LABELS: Record<ExportFormat, string> = {
    json: "JSON",
    react: "React Component",
    embed: "Embed Code",
  };

  const copyFormat = async (format: ExportFormat) => {
    const outputs = {
      json: toJSONSchema(form),
      react: toReactCode(form),
      embed: toEmbedCode(form),
    };
    try {
      await navigator.clipboard.writeText(outputs[format]);
      toast.success(`${COPY_LABELS[format]} copied to clipboard`);
    } catch {
      toast.error("Couldn't access the clipboard");
    }
  };

  const handleSave = () => {
    setSaveState("saving");
    saveForm();
    setTimeout(() => {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1000);
    }, 400);
  };

  const handleNewForm = () => {
    if (
      window.confirm(
        "Start a new form? Your current draft will be cleared."
      )
    ) {
      resetForm();
      toast.success("New form created");
    }
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
              className={canUndo ? "" : "opacity-40"}
            >
              <Undo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo — Ctrl+Z</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={!canRedo}
              aria-label="Redo"
              className={canRedo ? "" : "opacity-40"}
            >
              <Redo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo — Ctrl+Shift+Z</TooltipContent>
        </Tooltip>

        <span className="mx-1 h-6 w-0.5 bg-line-soft max-sm:hidden" aria-hidden />

        {/* Desktop: show all controls inline */}
        <div className="hidden items-center gap-1 sm:flex">
          <ThemeToggle />
          <ShortcutsDialog />

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
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePreview}
          className="max-sm:hidden"
        >
          <ExternalLink />
          Preview
        </Button>

        {/* Mobile: overflow menu for secondary actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="More actions"
              className="sm:hidden"
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="sm:hidden">
            <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
              <Settings2 />
              Form settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handlePreview}>
              <ExternalLink />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setShortcutsOpen(true)}>
              <Keyboard />
              Keyboard shortcuts
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <ThemeToggleDropdownItem />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleNewForm}
              className="text-crimson focus:bg-crimson focus:text-white"
            >
              <FileText />
              New form
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="brand" size="sm">
              <Download />
              <span className="max-sm:hidden">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export as</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => copyFormat("json")}>
              <Braces />
              Copy JSON
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => copyFormat("react")}>
              <Code2 />
              Copy React Component
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => copyFormat("embed")}>
              <ExternalLink />
              Copy Embed Code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => openExport("json")}>
              <Download />
              View &amp; export code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleNewForm}
              className="text-crimson focus:bg-crimson focus:text-white"
            >
              <FileText />
              New form
            </DropdownMenuItem>
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

        <Button size="sm" onClick={handleSave} disabled={saveState === "saving"}>
          {saveState === "saving" ? (
            <Loader2 className="animate-spin" />
          ) : saveState === "saved" ? (
            <Save />
          ) : (
            <Save />
          )}
          <span className="max-sm:hidden">
            {saveState === "saving"
              ? "Saving…"
              : saveState === "saved"
                ? "Saved ✓"
                : isDirty
                  ? "Save*"
                  : "Save"}
          </span>
        </Button>
      </div>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        initialTab={exportTab}
      />
      <FormSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ShortcutsDialog openExternal={shortcutsOpen} onOpenExternalChange={setShortcutsOpen} />
    </header>
  );
}
