"use client";

import { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Braces,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  FileText,
  Hammer,
  Keyboard,
  Link2,
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
import { useBuilderStore } from "@/lib/store";
import { copyToClipboard, downloadFile } from "@/lib/clipboard";
import {
  encodeSchemaToURL,
  kebabCase,
  pascalCase,
  toEmbedCode,
  toJSONSchema,
  toReactCode,
} from "@/lib/export";
import { relativeTime } from "@/lib/utils";
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

/**
 * Autosave status between the title and the history controls:
 * saving spinner → error + retry → "Saved <relative time>".
 */
function AutosaveIndicator() {
  const lastSavedAt = useBuilderStore((s) => s.lastSavedAt);
  const isSaving = useBuilderStore((s) => s.isSaving);
  const saveError = useBuilderStore((s) => s.saveError);
  const saveForm = useBuilderStore((s) => s.saveForm);

  // Re-render periodically so the relative time stays fresh.
  const [, tick] = useReducer((c: number) => c + 1, 0);
  useEffect(() => {
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, []);

  if (isSaving) {
    return (
      <span
        className="flex shrink-0 items-center gap-1 text-xs text-foreground/60"
        role="status"
      >
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
        Saving…
      </span>
    );
  }

  if (saveError) {
    return (
      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-crimson">
        Save failed
        <button
          type="button"
          aria-label="Retry save"
          onClick={() => void saveForm()}
          className="rounded-sm p-1 transition-colors focus-hard hover:bg-crimson hover:text-white"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </span>
    );
  }

  if (lastSavedAt) {
    return (
      <span className="shrink-0 text-xs text-foreground/60 max-md:hidden">
        Saved {relativeTime(lastSavedAt)}
      </span>
    );
  }

  return null;
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

  const isSaving = useBuilderStore((s) => s.isSaving);

  const [title, setTitle] = useState(form.title);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportTab, setExportTab] = useState<ExportFormat>("json");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

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

  const exportOutput = (format: ExportFormat) =>
    format === "json"
      ? toJSONSchema(form)
      : format === "react"
        ? toReactCode(form)
        : toEmbedCode(form);

  const copyFormat = (format: ExportFormat) => {
    void copyToClipboard(exportOutput(format), COPY_LABELS[format]);
  };

  const downloadFormat = (format: ExportFormat) => {
    if (format === "json") {
      downloadFile(
        exportOutput("json"),
        `${kebabCase(form.title)}.formforge.json`,
        "application/json",
      );
    } else if (format === "react") {
      downloadFile(
        exportOutput("react"),
        `${pascalCase(form.title)}Form.tsx`,
        "text/plain",
      );
    } else {
      // A self-contained page so the download works on double-click.
      const html = [
        "<!doctype html>",
        `<html lang="en">`,
        `<head><meta charset="utf-8"><title>${form.title.replace(/</g, "&lt;")}</title></head>`,
        "<body>",
        toEmbedCode(form),
        "</body>",
        "</html>",
      ].join("\n");
      downloadFile(html, `${kebabCase(form.title)}-embed.html`, "text/html");
    }
  };

  const copyShareLink = () => {
    const url = encodeSchemaToURL(form);
    if (!url) {
      toast.error(
        "Form is too large for a shareable link. Use JSON export instead.",
      );
      return;
    }
    void copyToClipboard(url, "Shareable link");
  };

  const handleSave = () => {
    void saveForm();
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
    void saveForm();
    window.open(`/preview/${form.id}`, "_blank", "noopener");
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b-2 border-line bg-background px-3 pt-[env(safe-area-inset-top)] sm:px-4">
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

        <AutosaveIndicator />
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
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>JSON Schema</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => copyFormat("json")}>
              <Copy />
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => downloadFormat("json")}>
              <Download />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>React Component</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => copyFormat("react")}>
              <Copy />
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => downloadFormat("react")}>
              <FileCode2 />
              Download .tsx
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Embed Code</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => copyFormat("embed")}>
              <Copy />
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => downloadFormat("embed")}>
              <Download />
              Download .html
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={copyShareLink}>
              <Link2 />
              Copy shareable link
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openExport("json")}>
              <Braces />
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
                if (
                  window.confirm(
                    "Reset the form? All fields and settings will be cleared.",
                  )
                ) {
                  resetForm();
                  toast.success("Form reset");
                }
              }}
              className="text-crimson focus:bg-crimson focus:text-white"
            >
              <RotateCcw />
              Reset form
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
          <span className="max-sm:hidden">
            {isSaving ? "Saving…" : isDirty ? "Save*" : "Save"}
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
