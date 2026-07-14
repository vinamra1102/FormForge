"use client";

import { useEffect } from "react";
import { closestCenter, DndContext, DragOverlay } from "@dnd-kit/core";
import type { FormField } from "@/types";
import type { FieldDefinition } from "@/lib/field-registry";
import { useBuilderStore } from "@/lib/store";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useUndo } from "@/hooks/useUndo";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { FIELD_ICONS } from "./field-icons";
import { Canvas } from "./Canvas";
import { FieldEditor } from "./FieldEditor";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";

function PaletteGhost({ definition }: { definition: FieldDefinition }) {
  const Icon = FIELD_ICONS[definition.icon];
  return (
    <div className="flex w-56 items-center gap-3 border-2 border-crimson bg-brand p-2.5 text-ink">
      <span className="flex size-8 shrink-0 items-center justify-center border-2 border-ink bg-paper">
        <Icon className="size-4" />
      </span>
      <span className="font-display text-sm font-bold">{definition.label}</span>
    </div>
  );
}

function FieldGhost({ field }: { field: FormField }) {
  return (
    <div className="border-2 border-crimson bg-surface px-4 py-3 opacity-90">
      <span className="font-display text-sm font-bold text-foreground">
        {field.label}
      </span>
    </div>
  );
}

/** Auto-save every 30s when the form has unsaved changes. */
function useAutoSave() {
  const isDirty = useBuilderStore((s) => s.isDirty);
  const saveForm = useBuilderStore((s) => s.saveForm);

  useEffect(() => {
    if (!isDirty) return;
    const interval = setInterval(() => {
      const dirty = useBuilderStore.getState().isDirty;
      if (dirty) {
        useBuilderStore.getState().saveForm();
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [isDirty, saveForm]);
}

/** The full builder: toolbar on top, palette | canvas | editor below. */
export function BuilderShell() {
  useUndo();
  useAutoSave();
  const { sensors, activeDrag, onDragStart, onDragEnd, onDragCancel } =
    useDragAndDrop();

  // Rehydrate the persisted form after mount (avoids SSR hydration mismatch)
  // and show a "Draft restored" toast if a saved form was loaded.
  useEffect(() => {
    void useBuilderStore.persist.rehydrate();
    // Check if there's a saved form before rehydration marks it as restored.
    const hasExisting =
      typeof window !== "undefined" &&
      window.localStorage.getItem("formforge:builder") !== null;
    if (hasExisting) {
      toast.success("Draft restored");
    }
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-dvh flex-col bg-background pb-[env(safe-area-inset-bottom)]">
        <Toolbar />
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <div className="flex min-h-0 flex-1 max-md:flex-col">
            <Sidebar />
            <Canvas />
            <FieldEditor />
          </div>
          <DragOverlay dropAnimation={null}>
            {activeDrag?.kind === "palette" && (
              <PaletteGhost definition={activeDrag.definition} />
            )}
            {activeDrag?.kind === "field" && (
              <FieldGhost field={activeDrag.field} />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </TooltipProvider>
  );
}
