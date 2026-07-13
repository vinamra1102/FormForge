"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import type { FormField } from "@/types";
import { cn } from "@/lib/utils";
import {
  FieldShell,
  errorMessage,
  type FieldComponentProps,
} from "./FieldShell";

/** Multi-select rendered as toggleable pills. */
export function MultiSelectField({
  field,
  isPreview = false,
}: FieldComponentProps) {
  if (!isPreview) {
    return (
      <FieldShell field={field} labelAsLegend>
        <div className="pointer-events-none flex flex-wrap gap-2">
          {(field.options ?? []).map((option) => (
            <span
              key={option.value}
              className="rounded-full border-2 border-line-soft bg-surface-muted px-3 py-1 text-sm text-foreground/50"
            >
              {option.label}
            </span>
          ))}
        </div>
      </FieldShell>
    );
  }
  return <LiveMultiSelectField field={field} />;
}

function LiveMultiSelectField({ field }: { field: FormField }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errorMessage(errors, field.id);

  return (
    <FieldShell field={field} error={error} labelAsLegend>
      <Controller
        control={control}
        name={field.id}
        render={({ field: rhf }) => {
          const selected: string[] = Array.isArray(rhf.value) ? rhf.value : [];
          const toggle = (value: string) => {
            rhf.onChange(
              selected.includes(value)
                ? selected.filter((v) => v !== value)
                : [...selected, value],
            );
          };
          return (
            <div
              role="group"
              aria-label={field.label}
              className="flex flex-wrap gap-2"
            >
              {(field.options ?? []).map((option) => {
                const active = selected.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggle(option.value)}
                    onBlur={rhf.onBlur}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm font-medium transition-colors focus-hard",
                      active
                        ? "border-crimson bg-crimson text-white"
                        : "border-line bg-surface text-foreground hover:border-crimson hover:bg-brand hover:text-ink",
                    )}
                  >
                    {active && <Check className="size-3.5" strokeWidth={3} />}
                    {option.label}
                  </button>
                );
              })}
            </div>
          );
        }}
      />
    </FieldShell>
  );
}
