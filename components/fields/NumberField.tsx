"use client";

import { useFormContext } from "react-hook-form";
import type { FormField } from "@/types";
import { Input } from "@/components/ui/input";
import {
  FieldShell,
  errorMessage,
  type FieldComponentProps,
} from "./FieldShell";

/** Number input with min/max/step. */
export function NumberField({ field, isPreview = false }: FieldComponentProps) {
  if (!isPreview) {
    return (
      <FieldShell field={field}>
        <Input
          type="text"
          placeholder={field.placeholder ?? "0"}
          readOnly
          tabIndex={-1}
          className="pointer-events-none bg-surface-muted"
        />
      </FieldShell>
    );
  }
  return <LiveNumberField field={field} />;
}

function LiveNumberField({ field }: { field: FormField }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errorMessage(errors, field.id);
  const min = field.validations.find((r) => r.type === "min")?.value;
  const max = field.validations.find((r) => r.type === "max")?.value;

  return (
    <FieldShell field={field} error={error}>
      <Input
        id={field.id}
        type="number"
        inputMode="decimal"
        placeholder={field.placeholder}
        min={min !== undefined ? Number(min) : undefined}
        max={max !== undefined ? Number(max) : undefined}
        step={field.step ?? "any"}
        aria-invalid={error ? true : undefined}
        {...register(field.id)}
      />
    </FieldShell>
  );
}
