"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { FormField } from "@/types";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  FieldShell,
  errorMessage,
  type FieldComponentProps,
} from "./FieldShell";

/** Radio group with horizontal/vertical layout support. */
export function RadioField({ field, isPreview = false }: FieldComponentProps) {
  const horizontal = field.layout === "horizontal";

  if (!isPreview) {
    return (
      <FieldShell field={field} labelAsLegend>
        <div
          className={cn(
            "pointer-events-none gap-2",
            horizontal ? "flex flex-wrap gap-x-5" : "grid",
          )}
        >
          {(field.options ?? []).map((option) => (
            <span
              key={option.value}
              className="flex items-center gap-2 text-sm text-foreground/50"
            >
              <span className="size-5 shrink-0 rounded-full border-2 border-line-soft bg-surface-muted" />
              {option.label}
            </span>
          ))}
        </div>
      </FieldShell>
    );
  }
  return <LiveRadioField field={field} />;
}

function LiveRadioField({ field }: { field: FormField }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errorMessage(errors, field.id);
  const horizontal = field.layout === "horizontal";

  return (
    <FieldShell field={field} error={error} labelAsLegend>
      <Controller
        control={control}
        name={field.id}
        render={({ field: rhf }) => (
          <RadioGroup
            value={(rhf.value as string) || ""}
            onValueChange={rhf.onChange}
            onBlur={rhf.onBlur}
            aria-label={field.label}
            aria-invalid={error ? true : undefined}
            className={cn(horizontal && "flex flex-wrap gap-x-5")}
          >
            {(field.options ?? []).map((option) => {
              const optionId = `${field.id}-${option.value}`;
              return (
                <div key={option.value} className="flex items-center gap-2">
                  <RadioGroupItem id={optionId} value={option.value} />
                  <Label
                    htmlFor={optionId}
                    className="cursor-pointer font-sans font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        )}
      />
    </FieldShell>
  );
}
