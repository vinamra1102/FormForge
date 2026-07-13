"use client";

import { useCallback, useMemo, useState } from "react";
import {
  FormProvider,
  useForm,
  type FieldValues,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FormSchema } from "@/types";
import {
  buildZodSchema,
  getDefaultValues,
  isFieldVisible,
  type FormValues,
} from "@/lib/validators";
import { ConditionalVisibility, FieldRenderer } from "@/components/fields";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SuccessScreen } from "./SuccessScreen";

function serializeSubmission(values: FormValues): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    output[key] = Array.isArray(value)
      ? value.map((item) => (item instanceof File ? item.name : item))
      : value;
  }
  return output;
}

/**
 * Renders the form for real: React Hook Form + a Zod schema rebuilt from the
 * currently *visible* fields on every validation pass, so conditionally
 * hidden fields are never validated or submitted.
 */
export function PreviewForm({ form }: { form: FormSchema }) {
  const [submission, setSubmission] = useState<Record<
    string,
    unknown
  > | null>(null);

  const fields = useMemo(
    () => [...form.fields].sort((a, b) => a.order - b.order),
    [form.fields],
  );

  const resolver = useCallback<Resolver<FieldValues>>(
    async (values, context, options) => {
      const visibleFields = fields.filter((field) =>
        isFieldVisible(field, values),
      );
      const schema = buildZodSchema(visibleFields);
      return zodResolver(schema)(values, context, options);
    },
    [fields],
  );

  const methods = useForm<FieldValues>({
    resolver,
    defaultValues: getDefaultValues(fields),
    mode: "onTouched",
  });

  const onSubmit = (values: FieldValues) => {
    setSubmission(serializeSubmission(values));
  };

  const reset = () => {
    methods.reset(getDefaultValues(fields));
    setSubmission(null);
  };

  if (submission) {
    return (
      <div className="space-y-4">
        <SuccessScreen
          message={form.settings.successMessage}
          onReset={reset}
        />
        <details className="border-2 border-line bg-surface p-4">
          <summary className="cursor-pointer font-display text-sm font-bold text-foreground focus-hard">
            View submission data
          </summary>
          <pre className="mt-3 overflow-auto border-2 border-line bg-ink p-3 font-mono text-xs leading-relaxed text-paper">
            <code>{JSON.stringify(submission, null, 2)}</code>
          </pre>
        </details>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        noValidate
        className="border-2 border-line bg-surface p-6 sm:p-8"
      >
        <header className="mb-6 border-b-2 border-line pb-4">
          <h1 className="font-display text-3xl font-bold text-foreground">
            {form.title}
          </h1>
          {form.description && (
            <p className="mt-1.5 text-sm text-foreground/60">
              {form.description}
            </p>
          )}
        </header>

        {fields.length === 0 ? (
          <p className="py-6 text-center text-sm text-foreground/60">
            This form has no fields yet. Add some in the builder!
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {fields.map((field) => (
              <ConditionalVisibility key={field.id} field={field}>
                <div
                  className={cn(
                    "min-w-0",
                    field.width === "half" ? "sm:col-span-1" : "sm:col-span-2",
                  )}
                >
                  <FieldRenderer field={field} isPreview />
                </div>
              </ConditionalVisibility>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Button
            type="submit"
            size="lg"
            disabled={methods.formState.isSubmitting}
            className="w-full sm:w-auto"
          >
            {form.settings.submitLabel || "Submit"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
