// ---------------------------------------------------------------------------
// FormForge shared types — the single source of truth for the form model.
// ---------------------------------------------------------------------------

/** Every field type the builder supports. */
export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "date"
  | "number"
  | "rating"
  | "file"
  | "section"
  | "conditional";

/** A single validation rule attached to a field. */
export type ValidationRule = {
  type:
    | "required"
    | "minLength"
    | "maxLength"
    | "min"
    | "max"
    | "pattern"
    | "email"
    | "url";
  value?: string | number;
  message: string;
};

/** Show/hide a field based on another field's live value. */
export type ConditionalLogic = {
  fieldId: string;
  operator: "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty";
  value: string;
  action: "show" | "hide";
};

/** One option for select / multiselect / radio fields. */
export type FieldOption = {
  label: string;
  value: string;
};

/** A single form field. */
export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  validations: ValidationRule[];
  options?: FieldOption[]; // for select/radio/checkbox groups
  conditional?: ConditionalLogic;
  width: "full" | "half";
  order: number;
  /** Textarea only: visible row count. */
  rows?: number;
  /** Radio only: option layout direction. */
  layout?: "horizontal" | "vertical";
  /** Number only: stepper increment. */
  step?: number;
  /** File only: accepted MIME types / extensions (comma separated). */
  accept?: string;
  /** File only: max file size in megabytes. */
  maxSizeMB?: number;
};

/** Form-level settings. */
export type FormSettings = {
  submitLabel: string;
  successMessage: string;
  theme: "light" | "dark";
};

/** The form itself — what gets exported. */
export type FormSchema = {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  settings: FormSettings;
  createdAt: string;
  updatedAt: string;
};

/** Builder (editor) state held in the Zustand store. */
export type BuilderState = {
  form: FormSchema;
  selectedFieldId: string | null;
  history: FormSchema[];
  historyIndex: number;
  isDirty: boolean;
};

/** Export formats supported by lib/export.ts and the /api/export route. */
export type ExportFormat = "json" | "react" | "embed";

/** Sidebar palette grouping. */
export type FieldCategory =
  | "Basic"
  | "Choice"
  | "Date & Number"
  | "Advanced"
  | "Layout";
