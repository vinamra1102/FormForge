"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { fieldsByCategory, type FieldDefinition } from "@/lib/field-registry";
import { useBuilderStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FIELD_ICONS } from "./field-icons";

function PaletteItem({ definition }: { definition: FieldDefinition }) {
  const addField = useBuilderStore((s) => s.addField);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${definition.type}`,
    data: { source: "palette", type: definition.type },
  });
  const Icon = FIELD_ICONS[definition.icon];

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      type="button"
      onClick={() => {
        addField(definition.type);
        toast.success(`${definition.label} field added`);
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

/** Component palette: search + categorised, draggable field types. */
export function Sidebar() {
  const [query, setQuery] = useState("");
  const groups = fieldsByCategory(query);

  return (
    <aside
      aria-label="Field palette"
      className="flex w-72 shrink-0 flex-col border-r-2 border-line bg-background max-md:w-full max-md:border-b-2 max-md:border-r-0"
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

      <div className="flex-1 space-y-5 overflow-y-auto p-3 max-md:flex max-md:gap-4 max-md:space-y-0 max-md:overflow-x-auto">
        {groups.length === 0 && (
          <p className="px-1 py-4 text-sm text-foreground/60">
            No fields match “{query}”.
          </p>
        )}
        {groups.map((group) => (
          <section key={group.category} className="max-md:shrink-0">
            <h3 className="mb-2 px-1 font-display text-xs font-bold uppercase tracking-widest text-foreground/50">
              {group.category}
            </h3>
            <div className="space-y-2 max-md:flex max-md:gap-2 max-md:space-y-0">
              {group.fields.map((definition) => (
                <PaletteItem key={definition.type} definition={definition} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
