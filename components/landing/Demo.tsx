"use client";

import { useState } from "react";
import Link from "next/link";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowRight, GripVertical, MoveRight, Plus, Trash2 } from "lucide-react";
import type { FieldType, FormField } from "@/types";
import { FIELD_REGISTRY } from "@/lib/field-registry";
import { arrayMove } from "@/lib/store";
import { FieldRenderer } from "@/components/fields";
import { Button } from "@/components/ui/button";
import { cn, uid } from "@/lib/utils";

/** Deterministic ids so server and client render identical markup. */
function demoField(
  type: FieldType,
  id: string,
  order: number,
  label: string,
): FormField {
  return {
    ...structuredClone(FIELD_REGISTRY[type].defaults),
    id,
    order,
    label,
  };
}

const INITIAL_FIELDS: FormField[] = [
  demoField("text", "demo-name", 0, "Your name"),
  demoField("select", "demo-topic", 1, "What are you building?"),
  demoField("rating", "demo-rating", 2, "How much do forms usually suck?"),
];

function DemoCard({
  field,
  onRemove,
}: {
  field: FormField;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-start gap-2 border-2 border-ink bg-paper p-3 text-ink",
        isDragging && "z-10 border-crimson opacity-80",
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${field.label}`}
        className="mt-1 cursor-grab rounded-sm p-1 text-ink/50 transition-colors focus-hard hover:bg-brand hover:text-ink active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="pointer-events-none min-w-0 flex-1">
        <FieldRenderer field={field} />
      </div>
      <button
        type="button"
        onClick={() => onRemove(field.id)}
        aria-label={`Remove ${field.label}`}
        className="mt-1 rounded-sm p-1 text-ink/50 transition-colors focus-hard hover:bg-crimson hover:text-white"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

/** Self-contained mini-builder — no sign-up, state lives in the component. */
export function Demo() {
  const [fields, setFields] = useState<FormField[]>(INITIAL_FIELDS);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setFields((current) => {
      const from = current.findIndex((f) => f.id === active.id);
      const to = current.findIndex((f) => f.id === over.id);
      return arrayMove(current, from, to);
    });
  };

  const add = (type: FieldType, label: string) => {
    setFields((current) => [
      ...current,
      demoField(type, uid("demo"), current.length, label),
    ]);
  };

  return (
    <section
      id="demo"
      className="border-b-2 border-ink bg-brand text-ink"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Try it right here.
            </h2>
            <p className="mt-2 flex items-center gap-2 font-display text-base font-medium">
              Try dragging a field
              <MoveRight className="size-5 text-crimson" aria-hidden />
              no sign-up required.
            </p>
          </div>
          <Button asChild>
            <Link href="/builder">
              Open the full builder
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="flex flex-col gap-2">
            <p className="font-display text-xs font-bold uppercase tracking-widest text-ink/60">
              Add a field
            </p>
            <Button
              variant="outline"
              size="sm"
              className="justify-start border-ink text-ink hover:bg-paper"
              onClick={() => add("textarea", "Tell us more")}
            >
              <Plus /> Long text
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start border-ink text-ink hover:bg-paper"
              onClick={() => add("checkbox", "Sign me up for updates")}
            >
              <Plus /> Checkbox
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start border-ink text-ink hover:bg-paper"
              onClick={() => add("date", "Launch date")}
            >
              <Plus /> Date
            </Button>
          </div>

          <div className="border-2 border-ink bg-mist p-4 sm:p-6">
            {fields.length === 0 ? (
              <p className="py-10 text-center font-display text-sm font-bold text-ink/60">
                All gone! Add a field from the left to keep playing.
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {fields.map((field) => (
                      <DemoCard
                        key={field.id}
                        field={field}
                        onRemove={(id) =>
                          setFields((current) =>
                            current.filter((f) => f.id !== id),
                          )
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
