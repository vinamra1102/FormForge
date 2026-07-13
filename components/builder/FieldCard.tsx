"use client";

import type { KeyboardEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Columns2, GripVertical, RectangleHorizontal, Trash2 } from "lucide-react";
import type { FormField } from "@/types";
import { FIELD_REGISTRY } from "@/lib/field-registry";
import { useBuilderStore } from "@/lib/store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FieldRenderer } from "@/components/fields";
import { cn } from "@/lib/utils";
import { FIELD_ICONS } from "./field-icons";

/**
 * A field on the canvas: selectable, draggable (via handle), deletable,
 * and keyboard operable — Delete removes, arrow keys reorder.
 */
export function FieldCard({ field }: { field: FormField }) {
  const selected = useBuilderStore((s) => s.selectedFieldId === field.id);
  const selectField = useBuilderStore((s) => s.selectField);
  const removeField = useBuilderStore((s) => s.removeField);
  const moveField = useBuilderStore((s) => s.moveField);
  const updateField = useBuilderStore((s) => s.updateField);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: { source: "canvas", fieldId: field.id },
  });

  const definition = FIELD_REGISTRY[field.type];
  const Icon = FIELD_ICONS[definition.icon];
  const isHalf = field.width === "half";

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Only when the card itself is focused — not its child controls.
    if (event.target !== event.currentTarget) return;
    switch (event.key) {
      case "Delete":
      case "Backspace":
        event.preventDefault();
        removeField(field.id);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveField(field.id, -1);
        break;
      case "ArrowDown":
        event.preventDefault();
        moveField(field.id, 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        selectField(field.id);
        break;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "min-w-0",
        isHalf ? "sm:col-span-1" : "sm:col-span-2",
        isDragging && "z-10 opacity-60",
      )}
    >
      <motion.div
        animate={{ scale: selected ? 1.015 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          selectField(field.id);
        }}
        onKeyDown={onKeyDown}
        aria-label={`${definition.label} field: ${field.label}. Press Enter to edit, Delete to remove, arrow keys to reorder.`}
        className={cn(
          "group border-2 bg-surface transition-colors focus-hard",
          selected ? "border-crimson" : "border-line hover:border-crimson/50",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-2 border-b-2 px-3 py-1.5",
            selected
              ? "border-crimson bg-crimson text-white"
              : "border-line-soft bg-surface-muted text-foreground/70",
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon className="size-3.5 shrink-0" />
            <span className="truncate font-display text-xs font-bold uppercase tracking-wide">
              {definition.label}
            </span>
          </span>

          <span className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateField(field.id, {
                      width: isHalf ? "full" : "half",
                    });
                  }}
                  aria-label={
                    isHalf ? "Expand to full width" : "Shrink to half width"
                  }
                  className={cn(
                    "rounded-sm p-1 transition-colors focus-hard",
                    selected
                      ? "hover:bg-white/20"
                      : "hover:bg-brand hover:text-ink",
                  )}
                >
                  {isHalf ? (
                    <RectangleHorizontal className="size-3.5" />
                  ) : (
                    <Columns2 className="size-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {isHalf ? "Full width" : "Half width"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeField(field.id);
                  }}
                  aria-label={`Delete ${field.label}`}
                  className={cn(
                    "rounded-sm p-1 transition-colors focus-hard",
                    selected
                      ? "hover:bg-white/20"
                      : "hover:bg-crimson hover:text-white",
                  )}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Delete field</TooltipContent>
            </Tooltip>

            <button
              type="button"
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              aria-label={`Drag to reorder ${field.label}`}
              className={cn(
                "cursor-grab rounded-sm p-1 transition-colors focus-hard active:cursor-grabbing",
                selected ? "hover:bg-white/20" : "hover:bg-brand hover:text-ink",
              )}
            >
              <GripVertical className="size-3.5" />
            </button>
          </span>
        </div>

        <div className="pointer-events-none p-4">
          <FieldRenderer field={field} />
        </div>
      </motion.div>
    </div>
  );
}
