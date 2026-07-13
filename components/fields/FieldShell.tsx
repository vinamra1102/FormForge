"use client";

import type { ReactNode } from "react";
import type { FormField } from "@/types";
import { fieldIsRequired } from "@/lib/validators";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Props shared by every field component. */
export type FieldComponentProps = {
  field: FormField;
  isPreview?: boolean;
};

type FieldShellProps = {
  field: FormField;
  error?: string;
  children: ReactNode;
  /** Override the label's htmlFor target (defaults to field.id). */
  labelFor?: string;
  /** Render the label as plain text (for group inputs like radios). */
  labelAsLegend?: boolean;
  className?: string;
};

/**
 * Shared chrome around every field: label with required marker, the input
 * itself, help text, and the inline validation error.
 */
export function FieldShell({
  field,
  error,
  children,
  labelFor,
  labelAsLegend = false,
  className,
}: FieldShellProps) {
  const required = fieldIsRequired(field);

  return (
    <div className={cn("space-y-1.5", className)}>
      {labelAsLegend ? (
        <span className="block font-display text-sm font-bold text-foreground">
          {field.label}
          {required && (
            <span className="text-crimson" aria-hidden>
              {" "}
              *
            </span>
          )}
        </span>
      ) : (
        <Label htmlFor={labelFor ?? field.id}>
          {field.label}
          {required && (
            <span className="text-crimson" aria-hidden>
              {" "}
              *
            </span>
          )}
        </Label>
      )}
      {children}
      {field.helpText && !error && (
        <p className="text-xs text-foreground/60">{field.helpText}</p>
      )}
      {error && (
        <p role="alert" className="text-xs font-semibold text-crimson">
          {error}
        </p>
      )}
    </div>
  );
}

/** Pull the error message for a field out of RHF's errors bag. */
export function errorMessage(
  errors: Record<string, unknown>,
  id: string,
): string | undefined {
  const entry = errors[id] as { message?: unknown } | undefined;
  return typeof entry?.message === "string" ? entry.message : undefined;
}
