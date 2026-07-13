import { z } from "zod";
import type {
  ConditionalLogic,
  FieldOption,
  FormField,
  FormSchema,
  FormSettings,
  ValidationRule,
} from "@/types";

/** Zod schema for a single validation rule. */
export const validationRuleSchema: z.ZodType<ValidationRule> = z.object({
  type: z.enum([
    "required",
    "minLength",
    "maxLength",
    "min",
    "max",
    "pattern",
    "email",
    "url",
  ]),
  value: z.union([z.string(), z.number()]).optional(),
  message: z.string(),
});

/** Zod schema for conditional show/hide logic. */
export const conditionalLogicSchema: z.ZodType<ConditionalLogic> = z.object({
  fieldId: z.string(),
  operator: z.enum([
    "equals",
    "not_equals",
    "contains",
    "is_empty",
    "is_not_empty",
  ]),
  value: z.string(),
  action: z.enum(["show", "hide"]),
});

export const fieldOptionSchema: z.ZodType<FieldOption> = z.object({
  label: z.string(),
  value: z.string(),
});

/** Zod schema for a single form field. */
export const fieldSchema: z.ZodType<FormField> = z.object({
  id: z.string().min(1),
  type: z.enum([
    "text",
    "textarea",
    "select",
    "multiselect",
    "checkbox",
    "radio",
    "date",
    "number",
    "rating",
    "file",
    "section",
    "conditional",
  ]),
  label: z.string(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  required: z.boolean(),
  validations: z.array(validationRuleSchema),
  options: z.array(fieldOptionSchema).optional(),
  conditional: conditionalLogicSchema.optional(),
  width: z.enum(["full", "half"]),
  order: z.number().int().nonnegative(),
  rows: z.number().int().positive().optional(),
  layout: z.enum(["horizontal", "vertical"]).optional(),
  step: z.number().optional(),
  accept: z.string().optional(),
  maxSizeMB: z.number().positive().optional(),
});

export const formSettingsSchema: z.ZodType<FormSettings> = z.object({
  submitLabel: z.string().min(1),
  successMessage: z.string(),
  theme: z.enum(["light", "dark"]),
});

/** Zod schema for the entire form. */
export const formSchema: z.ZodType<FormSchema> = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(fieldSchema),
  settings: formSettingsSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Parse unknown input into a FormSchema, throwing on invalid shape. */
export function parseFormSchema(input: unknown): FormSchema {
  return formSchema.parse(input);
}

/** Safe variant returning a result object instead of throwing. */
export function safeParseFormSchema(input: unknown) {
  return formSchema.safeParse(input);
}
