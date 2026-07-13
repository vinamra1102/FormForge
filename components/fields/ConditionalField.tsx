"use client";

import type { ReactNode } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { GitBranch } from "lucide-react";
import type { FormField } from "@/types";
import { isFieldVisible } from "@/lib/validators";
import { useBuilderStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import {
  FieldShell,
  errorMessage,
  type FieldComponentProps,
} from "./FieldShell";

const OPERATOR_LABELS: Record<string, string> = {
  equals: "equals",
  not_equals: "does not equal",
  contains: "contains",
  is_empty: "is empty",
  is_not_empty: "is not empty",
};

/**
 * Visibility wrapper used in preview mode: watches the source field's live
 * value and mounts/unmounts its children based on the conditional rule.
 * Works for ANY field that has conditional logic configured, not just the
 * dedicated "conditional" field type.
 */
export function ConditionalVisibility({
  field,
  children,
}: {
  field: FormField;
  children: ReactNode;
}) {
  const { control } = useFormContext();
  const values = useWatch({ control }) as Record<string, unknown>;
  if (!isFieldVisible(field, values)) return null;
  return <>{children}</>;
}

/**
 * The palette's "Conditional" field type: a text input that ships with a
 * show/hide rule slot. In builder mode it displays a summary of its rule.
 */
export function ConditionalField({
  field,
  isPreview = false,
}: FieldComponentProps) {
  if (!isPreview) {
    return <BuilderConditionalField field={field} />;
  }
  return <LiveConditionalField field={field} />;
}

function BuilderConditionalField({ field }: { field: FormField }) {
  const sourceField = useBuilderStore((s) =>
    s.form.fields.find((f) => f.id === field.conditional?.fieldId),
  );

  const rule = field.conditional;
  const summary = rule?.fieldId
    ? `${rule.action === "show" ? "Shows" : "Hides"} when “${
        sourceField?.label ?? "deleted field"
      }” ${OPERATOR_LABELS[rule.operator]}${
        rule.operator === "is_empty" || rule.operator === "is_not_empty"
          ? ""
          : ` “${rule.value}”`
      }`
    : "No rule yet — configure it in the Conditional tab";

  return (
    <FieldShell field={field}>
      <Input
        placeholder={field.placeholder}
        readOnly
        tabIndex={-1}
        className="pointer-events-none bg-surface-muted"
      />
      <p className="flex items-center gap-1.5 text-xs font-medium text-crimson">
        <GitBranch className="size-3.5 shrink-0" />
        {summary}
      </p>
    </FieldShell>
  );
}

function LiveConditionalField({ field }: { field: FormField }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errorMessage(errors, field.id);

  return (
    <FieldShell field={field} error={error}>
      <Input
        id={field.id}
        type="text"
        placeholder={field.placeholder}
        aria-invalid={error ? true : undefined}
        {...register(field.id)}
      />
    </FieldShell>
  );
}
