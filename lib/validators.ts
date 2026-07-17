import { z } from "zod";
import type { FormField, ValidationRule } from "@/types";

/** The shape of values produced by the live preview form. */
export type FormValues = Record<string, unknown>;

/** Normalise any field value to a comparison string for conditional logic. */
function toComparable(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "boolean") return raw ? "true" : "";
  if (Array.isArray(raw)) return raw.map(String).join(",");
  return String(raw);
}

function isEmptyValue(raw: unknown): boolean {
  if (raw == null) return true;
  if (typeof raw === "boolean") return !raw;
  if (Array.isArray(raw)) return raw.length === 0;
  return String(raw).trim() === "";
}

/**
 * Evaluate a field's conditional logic against the current form values.
 * Fields without conditional logic are always visible.
 */
export function isFieldVisible(field: FormField, values: FormValues): boolean {
  const rule = field.conditional;
  if (!rule || !rule.fieldId) return true;

  const raw = values[rule.fieldId];
  const comparable = toComparable(raw);

  let matches: boolean;
  switch (rule.operator) {
    case "equals":
      matches = comparable === rule.value;
      break;
    case "not_equals":
      matches = comparable !== rule.value;
      break;
    case "contains":
      matches = Array.isArray(raw)
        ? raw.map(String).includes(rule.value)
        : comparable.includes(rule.value);
      break;
    case "is_empty":
      matches = isEmptyValue(raw);
      break;
    case "is_not_empty":
      matches = !isEmptyValue(raw);
      break;
  }

  return rule.action === "show" ? matches : !matches;
}

/** Numeric rule value, or null when the rule was left empty/invalid. */
function ruleValue(rule: ValidationRule): number | null {
  if (rule.value === undefined || rule.value === "") return null;
  const n = typeof rule.value === "number" ? rule.value : Number(rule.value);
  return Number.isNaN(n) ? null : n;
}

function requiredMessage(field: FormField): string {
  const custom = field.validations.find((r) => r.type === "required");
  return custom?.message || `${field.label || "This field"} is required`;
}

/** A field is required if flagged directly or via a `required` rule. */
export function fieldIsRequired(field: FormField): boolean {
  return field.required || field.validations.some((r) => r.type === "required");
}

const isRequired = fieldIsRequired;

function stringFieldSchema(field: FormField): z.ZodTypeAny {
  let schema = z.string();

  for (const rule of field.validations) {
    const n = ruleValue(rule);
    switch (rule.type) {
      case "minLength":
        if (n !== null) schema = schema.min(n, rule.message);
        break;
      case "maxLength":
        if (n !== null) schema = schema.max(n, rule.message);
        break;
      case "pattern":
        if (typeof rule.value === "string" && rule.value) {
          try {
            schema = schema.regex(new RegExp(rule.value), rule.message);
          } catch {
            // Invalid user-supplied regex — skip the rule rather than crash.
          }
        }
        break;
      case "email":
        schema = schema.email(rule.message);
        break;
      case "url":
        schema = schema.url(rule.message);
        break;
      default:
        break;
    }
  }

  if (isRequired(field)) {
    return schema.min(1, requiredMessage(field));
  }
  // Optional: allow empty string / undefined but still validate real input.
  return z.union([z.literal(""), schema]).optional();
}

function dateFieldSchema(field: FormField): z.ZodTypeAny {
  let schema: z.ZodTypeAny = z.string();

  for (const rule of field.validations) {
    if (rule.type === "min" && typeof rule.value === "string" && rule.value) {
      const min = rule.value;
      schema = schema.refine(
        (v: string) => v === "" || v >= min,
        rule.message,
      );
    }
    if (rule.type === "max" && typeof rule.value === "string" && rule.value) {
      const max = rule.value;
      schema = schema.refine(
        (v: string) => v === "" || v <= max,
        rule.message,
      );
    }
  }

  if (isRequired(field)) {
    return z
      .string()
      .min(1, requiredMessage(field))
      .pipe(schema as z.ZodType<string>);
  }
  return schema.optional();
}

function numberFieldSchema(field: FormField): z.ZodTypeAny {
  let schema = z.number({
    required_error: requiredMessage(field),
    invalid_type_error: `${field.label || "This field"} must be a number`,
  });

  for (const rule of field.validations) {
    const n = ruleValue(rule);
    if (n === null) continue;
    if (rule.type === "min") schema = schema.min(n, rule.message);
    if (rule.type === "max") schema = schema.max(n, rule.message);
  }

  const base = isRequired(field) ? schema : schema.optional();
  // Inputs deliver strings; empty string means "no answer".
  return z.preprocess((v) => {
    if (v === "" || v == null) return undefined;
    if (typeof v === "number") return v;
    const parsed = Number(v);
    return Number.isNaN(parsed) ? v : parsed;
  }, base);
}

function multiselectFieldSchema(field: FormField): z.ZodTypeAny {
  let schema = z.array(z.string());
  if (isRequired(field)) {
    schema = schema.min(1, requiredMessage(field));
  }
  for (const rule of field.validations) {
    const n = ruleValue(rule);
    if (n === null) continue;
    if (rule.type === "min") schema = schema.min(n, rule.message);
    if (rule.type === "max") schema = schema.max(n, rule.message);
  }
  return schema;
}

function checkboxFieldSchema(field: FormField): z.ZodTypeAny {
  if (isRequired(field)) {
    return z.boolean().refine((v) => v === true, requiredMessage(field));
  }
  return z.boolean().optional();
}

function ratingFieldSchema(field: FormField): z.ZodTypeAny {
  const stars = z
    .number({ required_error: requiredMessage(field) })
    .int()
    .min(1, requiredMessage(field))
    .max(5, "Rating cannot exceed 5 stars");
  // The rating widget stores 0 for "not yet rated".
  const normalize = (v: unknown) => (v === 0 || v == null ? undefined : v);
  return isRequired(field)
    ? z.preprocess(normalize, stars)
    : z.preprocess(normalize, stars.optional());
}

function fileFieldSchema(field: FormField): z.ZodTypeAny {
  let schema = z.custom<File[]>(
    (v) => Array.isArray(v) && v.every((f) => f instanceof File),
    "Invalid file input",
  );

  if (field.maxSizeMB) {
    const maxBytes = field.maxSizeMB * 1024 * 1024;
    schema = schema.refine(
      (files) => files.every((f) => f.size <= maxBytes),
      `Each file must be under ${field.maxSizeMB}MB`,
    );
  }

  if (isRequired(field)) {
    return schema.refine((files) => files.length > 0, requiredMessage(field));
  }
  return schema.optional().or(z.undefined());
}

/** Build the Zod schema for a single field. */
export function buildFieldSchema(field: FormField): z.ZodTypeAny {
  switch (field.type) {
    case "text":
    case "textarea":
    case "conditional":
      return stringFieldSchema(field);
    case "select":
    case "radio":
      return stringFieldSchema(field);
    case "date":
      return dateFieldSchema(field);
    case "number":
      return numberFieldSchema(field);
    case "multiselect":
      return multiselectFieldSchema(field);
    case "checkbox":
      return checkboxFieldSchema(field);
    case "rating":
      return ratingFieldSchema(field);
    case "file":
      return fileFieldSchema(field);
    case "section":
      return z.any();
  }
}

/**
 * Dynamically build a Zod object schema from field definitions.
 * Section breaks carry no data and are skipped.
 */
export function buildZodSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    if (field.type === "section") continue;
    shape[field.id] = buildFieldSchema(field);
  }
  return z.object(shape);
}

/** Default values keyed by field id, matching what each input expects. */
export function getDefaultValues(fields: FormField[]): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    switch (field.type) {
      case "section":
        break;
      case "multiselect":
        values[field.id] = [];
        break;
      case "checkbox":
        values[field.id] = false;
        break;
      case "rating":
        values[field.id] = 0;
        break;
      case "file":
        values[field.id] = [];
        break;
      default:
        values[field.id] = "";
    }
  }
  return values;
}
