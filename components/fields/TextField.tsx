"use client";

import { useFormContext } from "react-hook-form";
import type { FormField } from "@/types";
import { Input } from "@/components/ui/input";
import {
  FieldShell,
  errorMessage,
  type FieldComponentProps,
} from "./FieldShell";

/** Single-line text input with min/max length validation. */
export function TextField({ field, isPreview = false }: FieldComponentProps) {
  if (!isPreview) {
    return (
      <FieldShell field={field}>
        <Input
          placeholder={field.placeholder}
          readOnly
          tabIndex={-1}
          className="pointer-events-none bg-surface-muted"
        />
      </FieldShell>
    );
  }
  return <LiveTextField field={field} />;
}

function LiveTextField({ field }: { field: FormField }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errorMessage(errors, field.id);
  const maxLength = field.validations.find((r) => r.type === "maxLength");

  return (
    <FieldShell field={field} error={error}>
      <Input
        id={field.id}
        type="text"
        placeholder={field.placeholder}
        maxLength={maxLength ? Number(maxLength.value) : undefined}
        aria-invalid={error ? true : undefined}
        {...register(field.id)}
      />
    </FieldShell>
  );
}
