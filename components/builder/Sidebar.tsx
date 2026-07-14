"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { fieldsByCategory, type FieldDefinition } from "@/lib/field-registry";
import { useBuilderStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FIELD_ICONS } from "./field-icons";

function PaletteItem({ definition }: { definition: FieldDefinition }) {
  const addField = useBuilderStore((s) => s.addField);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${definition.type}`,
    data: { source: "palette", type: definition.type },
  });
  const Icon = FIELD_ICONS[definition.icon];

  const add = () => {
    addField(definition.type);
    toast.success(`${definition.label} field added`);
  };

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      type="button"
      onClick={add}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          add();
        }
      }}
      className={cn(
        "flex w-full cursor-grab items-center gap-3 border-2 border-line bg-surface p-2.5 text-left transition-colors focus-hard hover:border-crimson hover:bg-brand hover:text-ink active:cursor-grabbing",
        "max-md:w-40 max-md:shrink-0",
        isDragging && "opacity-40",
      )}
      aria-label={`Add ${definition.label} field — click or drag onto the canvas`}
    >
      <span className="flex size-8 shrink-0 items-center justify-center border-2 border-line bg-brand text-ink">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-sm font-bold leading-tight">
          {definition.label}
        </span>
        <span className="block truncate text-xs text-foreground/60 max-md:hidden">
          {definition.description}
        </span>
      </span>
    </button>
  );
}

function IconOnlyPaletteItem({ definition }: { definition: FieldDefinition }) {
  const addField = useBuilderStore((s) => s.addField);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${definition.type}`,
    data: { source: "palette", type: definition.type },
  });
  const Icon = FIELD_ICONS[definition.icon];

  const add = () => {
    addField(definition.type);
    toast.success(`${definition.label} field added`);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          type="button"
          onClick={add}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              add();
            }
          }}
          className={cn(
            "flex size-10 shrink-0 cursor-grab items-center justify-center border-2 border-line bg-surface transition-colors focus-hard hover:border-crimson hover:bg-brand hover:text-ink active:cursor-grabbing",
            isDragging && "opacity-40",
          )}
          aria-label={`Add ${definition.label} field`}
        >
          <Icon className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{definition.label}</TooltipContent>
    </Tooltip>
  );
}

function MobilePillPaletteItem({
  definition,
}: {
  definition: FieldDefinition;
}) {
  const addField = useBuilderStore((s) => s.addField);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${definition.type}`,
    data: { source: "palette", type: definition.type },
  });
  const Icon = FIELD_ICONS[definition.icon];

  const add = () => {
    addField(definition.type);
    toast.success(`${definition.label} field added`);
  };

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      type="button"
      onClick={add}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          add();
        }
      }}
      className={cn(
        "flex shrink-0 cursor-grab items-center gap-1.5 border-2 border-line bg-surface px-3 py-2 text-left transition-colors focus-hard hover:border-crimson hover:bg-brand hover:text-ink active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
      aria-label={`Add ${definition.label} field`}
    >
      <Icon className="size-4 shrink-0" />
      <span className="whitespace-nowrap font-display text-xs font-bold">
        {definition.label}
      </span>
    </button>
  );
}

/** Component palette: search + categorised, draggable field types. */
export function Sidebar() {
  const [query, setQuery] = useState("");
  const groups = fieldsByCategory(query);

  return (
    <>
      {/* ── Mobile: stacked pill palette (≤768px) ── */}
      <aside
        aria-label="Field palette"
        className="hidden w-full shrink-0 flex-col border-b-2 border-line bg-background max-md:flex"
      >
        <div className="border-b-2 border-line p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fields…"
              aria-label="Search field types"
              className="h-9 pl-9"
            />
          </div>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-2">
          {groups.length === 0 && (
            <p className="px-1 py-3 text-sm text-foreground/60">
              No fields match &ldquo;{query}&rdquo;.
            </p>
          )}
          {groups.map((group) => (
            <section key={group.category}>
              <h3 className="mb-1.5 px-1 font-display text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                {group.category}{" "}
                <span className="text-foreground/30">({group.fields.length})</span>
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {group.fields.map((definition) => (
                  <MobilePillPaletteItem
                    key={definition.type}
                    definition={definition}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </aside>

      {/* ── Tablet: icon-only sidebar (768–1024px) ── */}
      <aside
        aria-label="Field palette"
        className="hidden w-14 shrink-0 flex-col items-center border-r-2 border-line bg-background md:flex lg:hidden"
      >
        <div className="w-full border-b-2 border-line p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-foreground/40" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="…"
              aria-label="Search field types"
              className="h-8 pl-7 text-xs"
            />
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto py-2">
          {groups.map((group) => (
            <section
              key={group.category}
              className="flex flex-col items-center gap-1"
            >
              <h3 className="mb-0.5 font-display text-[9px] font-bold uppercase tracking-widest text-foreground/40">
                {group.category.charAt(0)}
              </h3>
              {group.fields.map((definition) => (
                <IconOnlyPaletteItem
                  key={definition.type}
                  definition={definition}
                />
              ))}
            </section>
          ))}
        </div>
      </aside>

      {/* ── Desktop: full sidebar with labels (>1024px) ── */}
      <aside
        aria-label="Field palette"
        className="hidden w-72 shrink-0 flex-col border-r-2 border-line bg-background lg:flex"
      >
        <div className="border-b-2 border-line p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fields…"
              aria-label="Search field types"
              className="h-9 pl-9"
            />
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-3">
          {groups.length === 0 && (
            <p className="px-1 py-4 text-sm text-foreground/60">
              No fields match &ldquo;{query}&rdquo;.
            </p>
          )}
          {groups.map((group) => (
            <section key={group.category}>
              <h3 className="mb-2 px-1 font-display text-xs font-bold uppercase tracking-widest text-foreground/50">
                {group.category}{" "}
                <span className="text-foreground/30">({group.fields.length})</span>
              </h3>
              <div className="space-y-2">
                {group.fields.map((definition) => (
                  <PaletteItem
                    key={definition.type}
                    definition={definition}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </aside>
    </>
  );
}
