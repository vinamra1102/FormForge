"use client";

import type { FieldComponentProps } from "./FieldShell";

/** Visual divider with an optional heading and description. */
export function SectionBreak({ field }: FieldComponentProps) {
  return (
    <div className="pt-2">
      <div className="mb-2 h-0.5 w-full bg-line" aria-hidden />
      {field.label && (
        <h3 className="font-display text-lg font-bold text-foreground">
          {field.label}
        </h3>
      )}
      {field.helpText && (
        <p className="mt-0.5 text-sm text-foreground/60">{field.helpText}</p>
      )}
    </div>
  );
}
