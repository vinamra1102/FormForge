import type {
  FieldCategory,
  FieldType,
  FormField,
} from "@/types";

/**
 * Central catalog of every field type: how it appears in the sidebar palette
 * and the defaults it gets when dropped on the canvas.
 * Icon names map to lucide-react exports (resolved in the UI layer so this
 * module stays server/test safe).
 */
export type FieldDefinition = {
  type: FieldType;
  label: string;
  description: string;
  category: FieldCategory;
  icon:
    | "Type"
    | "AlignLeft"
    | "ChevronDown"
    | "ListChecks"
    | "CheckSquare"
    | "CircleDot"
    | "Calendar"
    | "Hash"
    | "Star"
    | "Upload"
    | "Minus"
    | "GitBranch";
  defaults: Omit<FormField, "id" | "order">;
};

const defaultOptions = [
  { label: "Option 1", value: "option_1" },
  { label: "Option 2", value: "option_2" },
  { label: "Option 3", value: "option_3" },
];

export const FIELD_REGISTRY: Record<FieldType, FieldDefinition> = {
  text: {
    type: "text",
    label: "Text",
    description: "Single line of text",
    category: "Basic",
    icon: "Type",
    defaults: {
      type: "text",
      label: "Text field",
      placeholder: "Type your answer…",
      required: false,
      validations: [],
      width: "full",
    },
  },
  textarea: {
    type: "textarea",
    label: "Long text",
    description: "Multi-line paragraph",
    category: "Basic",
    icon: "AlignLeft",
    defaults: {
      type: "textarea",
      label: "Long answer",
      placeholder: "Write a few sentences…",
      required: false,
      validations: [],
      width: "full",
      rows: 4,
    },
  },
  select: {
    type: "select",
    label: "Dropdown",
    description: "Pick one from a list",
    category: "Choice",
    icon: "ChevronDown",
    defaults: {
      type: "select",
      label: "Dropdown",
      placeholder: "Select an option…",
      required: false,
      validations: [],
      options: defaultOptions,
      width: "full",
    },
  },
  multiselect: {
    type: "multiselect",
    label: "Multi-select",
    description: "Pick several options",
    category: "Choice",
    icon: "ListChecks",
    defaults: {
      type: "multiselect",
      label: "Multi-select",
      helpText: "Choose all that apply.",
      required: false,
      validations: [],
      options: defaultOptions,
      width: "full",
    },
  },
  checkbox: {
    type: "checkbox",
    label: "Checkbox",
    description: "Single yes/no toggle",
    category: "Choice",
    icon: "CheckSquare",
    defaults: {
      type: "checkbox",
      label: "I agree to the terms",
      required: false,
      validations: [],
      width: "full",
    },
  },
  radio: {
    type: "radio",
    label: "Radio group",
    description: "Pick exactly one",
    category: "Choice",
    icon: "CircleDot",
    defaults: {
      type: "radio",
      label: "Radio group",
      required: false,
      validations: [],
      options: defaultOptions,
      width: "full",
      layout: "vertical",
    },
  },
  date: {
    type: "date",
    label: "Date",
    description: "Calendar date picker",
    category: "Date & Number",
    icon: "Calendar",
    defaults: {
      type: "date",
      label: "Date",
      required: false,
      validations: [],
      width: "full",
    },
  },
  number: {
    type: "number",
    label: "Number",
    description: "Numeric input",
    category: "Date & Number",
    icon: "Hash",
    defaults: {
      type: "number",
      label: "Number",
      placeholder: "0",
      required: false,
      validations: [],
      width: "full",
      step: 1,
    },
  },
  rating: {
    type: "rating",
    label: "Rating",
    description: "1–5 star rating",
    category: "Advanced",
    icon: "Star",
    defaults: {
      type: "rating",
      label: "Rate your experience",
      required: false,
      validations: [],
      width: "full",
    },
  },
  file: {
    type: "file",
    label: "File upload",
    description: "Drag-and-drop files",
    category: "Advanced",
    icon: "Upload",
    defaults: {
      type: "file",
      label: "Upload a file",
      helpText: "Drag a file here or click to browse.",
      required: false,
      validations: [],
      width: "full",
      maxSizeMB: 10,
    },
  },
  section: {
    type: "section",
    label: "Section break",
    description: "Divider with heading",
    category: "Layout",
    icon: "Minus",
    defaults: {
      type: "section",
      label: "New section",
      helpText: "Optional section description.",
      required: false,
      validations: [],
      width: "full",
    },
  },
  conditional: {
    type: "conditional",
    label: "Conditional",
    description: "Shows based on an answer",
    category: "Advanced",
    icon: "GitBranch",
    defaults: {
      type: "conditional",
      label: "Conditional field",
      placeholder: "Visible only when the rule matches…",
      helpText: "Configure the show/hide rule in the Conditional tab.",
      required: false,
      validations: [],
      width: "full",
    },
  },
};

export const FIELD_CATEGORIES: FieldCategory[] = [
  "Basic",
  "Choice",
  "Date & Number",
  "Advanced",
  "Layout",
];

export function fieldsByCategory(
  query = "",
): { category: FieldCategory; fields: FieldDefinition[] }[] {
  const q = query.trim().toLowerCase();
  return FIELD_CATEGORIES.map((category) => ({
    category,
    fields: Object.values(FIELD_REGISTRY).filter(
      (def) =>
        def.category === category &&
        (q === "" ||
          def.label.toLowerCase().includes(q) ||
          def.description.toLowerCase().includes(q) ||
          def.type.includes(q)),
    ),
  })).filter((group) => group.fields.length > 0);
}
