"use client";

import { useFormContext } from "react-hook-form";
import type { FormField } from "@/types";
import { Input } from "@/components/ui/input";
import {
  FieldShell,
  errorMessage,
  type FieldComponentProps,
} from "./FieldShell";

/** Native date input with min/max date constraints. */
export function DateField({ field, isPreview = false }: FieldComponentProps) {
  if (!isPreview) {
    return (
      <FieldShell field={field}>
        <Input
          type="date"
          readOnly
          tabIndex={-1}
          className="pointer-events-none bg-surface-muted"
        />
      </FieldShell>
    );
  }
  return <LiveDateField field={field} />;
}

function LiveDateField({ field }: { field: FormField }) {
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
        type="date"
        min={min !== undefined ? String(min) : undefined}
        max={max !== undefined ? String(max) : undefined}
        aria-invalid={error ? true : undefined}
        {...register(field.id)}
      />
    </FieldShell>
  );
}
