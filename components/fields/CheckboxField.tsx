"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { FormField } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { fieldIsRequired } from "@/lib/validators";
import { errorMessage, type FieldComponentProps } from "./FieldShell";

/** Single boolean checkbox with its label inline. */
export function CheckboxField({
  field,
  isPreview = false,
}: FieldComponentProps) {
  if (!isPreview) {
    return (
      <div className="pointer-events-none space-y-1.5">
        <div className="flex items-center gap-2.5">
          <span className="size-5 shrink-0 rounded-[4px] border-2 border-line-soft bg-surface-muted" />
          <span className="font-display text-sm font-bold text-foreground/70">
            {field.label}
            {fieldIsRequired(field) && (
              <span className="text-crimson"> *</span>
            )}
          </span>
        </div>
        {field.helpText && (
          <p className="pl-[30px] text-xs text-foreground/60">
            {field.helpText}
          </p>
        )}
      </div>
    );
  }
  return <LiveCheckboxField field={field} />;
}

function LiveCheckboxField({ field }: { field: FormField }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errorMessage(errors, field.id);
  const required = fieldIsRequired(field);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2.5">
        <Controller
          control={control}
          name={field.id}
          render={({ field: rhf }) => (
            <Checkbox
              id={field.id}
              checked={Boolean(rhf.value)}
              onCheckedChange={rhf.onChange}
              onBlur={rhf.onBlur}
              aria-invalid={error ? true : undefined}
            />
          )}
        />
        <Label htmlFor={field.id} className="cursor-pointer">
          {field.label}
          {required && (
            <span className="text-crimson" aria-hidden>
              {" "}
              *
            </span>
          )}
        </Label>
      </div>
      {field.helpText && !error && (
        <p className="pl-[30px] text-xs text-foreground/60">{field.helpText}</p>
      )}
      {error && (
        <p role="alert" className="pl-[30px] text-xs font-semibold text-crimson">
          {error}
        </p>
      )}
    </div>
  );
}
