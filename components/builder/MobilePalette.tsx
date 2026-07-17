"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { fieldsByCategory, type FieldDefinition } from "@/lib/field-registry";
import { useBuilderStore } from "@/lib/store";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/input";
import { FIELD_ICONS } from "./field-icons";

function PalettePill({
  definition,
  onAdd,
}: {
  definition: FieldDefinition;
  onAdd: (definition: FieldDefinition) => void;
}) {
  const Icon = FIELD_ICONS[definition.icon];
  return (
    <button
      type="button"
      onClick={() => onAdd(definition)}
      className="flex h-11 shrink-0 items-center gap-1.5 border-2 border-line bg-surface px-3 transition-colors focus-hard hover:border-crimson hover:bg-brand hover:text-ink"
      aria-label={`Add ${definition.label} field`}
    >
      <Icon className="size-4 shrink-0" />
      <span className="whitespace-nowrap font-display text-xs font-bold">
        {definition.label}
      </span>
    </button>
  );
}

/**
 * Mobile-only palette: a floating "+" button that opens a bottom sheet of
 * field pills. Tapping a pill adds the field, snaps the sheet down, and
 * scrolls the canvas to the new field.
 */
export function MobilePalette() {
  const selectedFieldId = useBuilderStore((s) => s.selectedFieldId);
  const addField = useBuilderStore((s) => s.addField);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [snapSignal, setSnapSignal] = useState(0);

  const groups = fieldsByCategory(query);

  const handleAdd = (definition: FieldDefinition) => {
    const id = addField(definition.type);
    toast.success(`${definition.label} field added`);
    setSnapSignal((n) => n + 1);
    // Let the canvas render the new card, then bring it into view.
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-field-id="${id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  return (
    <div className="md:hidden">
      {/* Floating add button — hidden while the field editor sheet is open. */}
      {!open && selectedFieldId === null && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Add a field"
          className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-30 flex size-14 items-center justify-center rounded-full border-2 border-ink bg-brand text-ink transition-transform focus-hard active:scale-[0.96]"
        >
          <Plus className="size-6" />
        </button>
      )}

      <BottomSheet
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Add a field"
        snapPoints={[220, 480]}
        snapToMinSignal={snapSignal}
      >
        <div className="space-y-4 px-4 pb-6 pt-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fields…"
              aria-label="Search field types"
              className="h-11 pl-9"
            />
          </div>

          {groups.length === 0 && (
            <p className="py-3 text-sm text-foreground/60">
              No fields match &ldquo;{query}&rdquo;.
            </p>
          )}

          {groups.map((group) => (
            <section key={group.category}>
              <h3 className="mb-1.5 font-display text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                {group.category}
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {group.fields.map((definition) => (
                  <PalettePill
                    key={definition.type}
                    definition={definition}
                    onAdd={handleAdd}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
