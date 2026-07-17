"use client";

import { useState } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { FieldType, FormField } from "@/types";
import { FIELD_REGISTRY, type FieldDefinition } from "@/lib/field-registry";
import { useBuilderStore } from "@/lib/store";

export const CANVAS_DROPPABLE_ID = "canvas-dropzone";

/** What is currently being dragged — used to render the DragOverlay ghost. */
export type ActiveDrag =
  | { kind: "palette"; definition: FieldDefinition }
  | { kind: "field"; field: FormField }
  | null;

type PaletteDragData = { source: "palette"; type: FieldType };
type CanvasDragData = { source: "canvas"; fieldId: string };
type DragData = PaletteDragData | CanvasDragData;

/**
 * Orchestrates both drag interactions in the builder:
 *  1. Palette → canvas: drop a new field (at the hovered position).
 *  2. Canvas → canvas: reorder existing fields.
 */
export function useDragAndDrop() {
  const addField = useBuilderStore((s) => s.addField);
  const reorderFields = useBuilderStore((s) => s.reorderFields);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    // Touch: long-press to drag so vertical scrolling still works.
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined;
    if (!data) return;
    if (data.source === "palette") {
      setActiveDrag({ kind: "palette", definition: FIELD_REGISTRY[data.type] });
    } else {
      const field = useBuilderStore
        .getState()
        .form.fields.find((f) => f.id === data.fieldId);
      if (field) setActiveDrag({ kind: "field", field });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const data = active.data.current as DragData | undefined;
    if (!data) return;

    const fields = useBuilderStore.getState().form.fields;

    if (data.source === "palette") {
      // Dropped on a specific field → insert at that position;
      // dropped on the canvas itself → append.
      const overIndex = fields.findIndex((f) => f.id === over.id);
      addField(data.type, overIndex === -1 ? undefined : overIndex);
      return;
    }

    if (active.id !== over.id && over.id !== CANVAS_DROPPABLE_ID) {
      reorderFields(String(active.id), String(over.id));
    }
  };

  const onDragCancel = () => setActiveDrag(null);

  return { sensors, activeDrag, onDragStart, onDragEnd, onDragCancel };
}
