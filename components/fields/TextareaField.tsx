"use client";

import { useFormContext, useWatch } from "react-hook-form";
import type { FormField } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  FieldShell,
  errorMessage,
  type FieldComponentProps,
} from "./FieldShell";

/** Multi-line text with configurable rows and a live character counter. */
export function TextareaField({
  field,
  isPreview = false,
}: FieldComponentProps) {
  if (!isPreview) {
    return (
      <FieldShell field={field}>
        <Textarea
          placeholder={field.placeholder}
          rows={field.rows ?? 4}
          readOnly
          tabIndex={-1}
          className="pointer-events-none resize-none bg-surface-muted"
        />
      </FieldShell>
    );
  }
  return <LiveTextareaField field={field} />;
}

function LiveTextareaField({ field }: { field: FormField }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const error = errorMessage(errors, field.id);
  const value = (useWatch({ control, name: field.id }) as string) ?? "";
  const maxRule = field.validations.find((r) => r.type === "maxLength");
  const max = maxRule ? Number(maxRule.value) : undefined;
  const overLimit = max !== undefined && value.length > max;

  return (
    <FieldShell field={field} error={error}>
      <Textarea
        id={field.id}
        rows={field.rows ?? 4}
        placeholder={field.placeholder}
        aria-invalid={error ? true : undefined}
        {...register(field.id)}
      />
      {max !== undefined && (
        <p
          className={cn(
            "text-right font-mono text-xs",
            overLimit ? "font-bold text-crimson" : "text-foreground/50",
          )}
        >
          {value.length}/{max}
        </p>
      )}
    </FieldShell>
  );
}
