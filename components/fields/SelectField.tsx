"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { FormField } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FieldShell,
  errorMessage,
  type FieldComponentProps,
} from "./FieldShell";

/** Dropdown built on Radix Select — fully keyboard accessible. */
export function SelectField({ field, isPreview = false }: FieldComponentProps) {
  if (!isPreview) {
    return (
      <FieldShell field={field}>
        <div className="pointer-events-none flex h-10 w-full items-center justify-between rounded-md border-2 border-line bg-surface-muted px-3 text-sm text-foreground/40">
          {field.placeholder || "Select an option…"}
          <span aria-hidden>▾</span>
        </div>
      </FieldShell>
    );
  }
  return <LiveSelectField field={field} />;
}

function LiveSelectField({ field }: { field: FormField }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errorMessage(errors, field.id);

  return (
    <FieldShell field={field} error={error}>
      <Controller
        control={control}
        name={field.id}
        render={({ field: rhf }) => (
          <Select
            value={(rhf.value as string) || undefined}
            onValueChange={rhf.onChange}
          >
            <SelectTrigger
              id={field.id}
              aria-invalid={error ? true : undefined}
              onBlur={rhf.onBlur}
            >
              <SelectValue
                placeholder={field.placeholder || "Select an option…"}
              />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FieldShell>
  );
}
