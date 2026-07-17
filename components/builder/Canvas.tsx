"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { CANVAS_DROPPABLE_ID } from "@/hooks/useDragAndDrop";
import { useBuilderStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { FieldCard } from "./FieldCard";

/** The main drop zone where fields are arranged. */
export function Canvas() {
  const fields = useBuilderStore((s) => s.form.fields);
  const selectField = useBuilderStore((s) => s.selectField);
  const { setNodeRef, isOver } = useDroppable({ id: CANVAS_DROPPABLE_ID });

  return (
    <main
      ref={setNodeRef}
      aria-label="Form canvas"
      onClick={(e) => {
        if (e.target === e.currentTarget) selectField(null);
      }}
      className={cn(
        "min-w-0 flex-1 overflow-y-auto bg-surface-muted p-4 transition-colors [touch-action:pan-y] sm:p-6",
        isOver && fields.length > 0 && "bg-brand/20",
      )}
    >
      <div
        className="mx-auto max-w-3xl"
        onClick={(e) => {
          if (e.target === e.currentTarget) selectField(null);
        }}
      >
        {fields.length === 0 ? (
          <EmptyState isOver={isOver} />
        ) : (
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={rectSortingStrategy}
          >
            {/* Extra mobile bottom padding clears the floating add button. */}
            <div className="grid grid-cols-1 gap-3 pb-24 max-md:pb-36 sm:grid-cols-2">
              {fields.map((field) => (
                <FieldCard key={field.id} field={field} />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </main>
  );
}
