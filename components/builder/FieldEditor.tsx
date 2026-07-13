"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";
import type {
  ConditionalLogic,
  FormField,
  ValidationRule,
} from "@/types";
import { FIELD_REGISTRY } from "@/lib/field-registry";
import { useBuilderStore } from "@/lib/store";
import { slugify, uid, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FIELD_ICONS } from "./field-icons";

// ---------------------------------------------------------------------------
// Small shared editor controls
// ---------------------------------------------------------------------------

/** Text input that syncs to the store after a short pause (undo-friendly). */
function TextSetting({
  id,
  label,
  value,
  onCommit,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onCommit: (next: string) => void;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value);
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;

  useEffect(() => setLocal(value), [value]);

  useEffect(() => {
    if (local === value) return;
    const timer = setTimeout(() => commitRef.current(local), 350);
    return () => clearTimeout(timer);
  }, [local, value]);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input
        id={id}
        value={local}
        placeholder={placeholder}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => local !== value && commitRef.current(local)}
        className="h-9"
      />
    </div>
  );
}

/** Brand-styled native select — compact and keyboard accessible. */
function SelectSetting({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  options: { label: string; value: string }[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className={cn(
        "h-9 w-full cursor-pointer rounded-md border-2 border-line bg-surface px-2 text-sm text-foreground focus-hard",
        className,
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** Segmented two-way toggle (e.g. full/half width). */
function SegmentedToggle<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { label: string; value: T }[];
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="grid grid-cols-2 gap-0 border-2 border-line"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-3 py-2 font-display text-xs font-bold uppercase tracking-wide transition-colors focus-hard",
            value === option.value
              ? "bg-crimson text-white"
              : "bg-surface text-foreground hover:bg-brand hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Content tab
// ---------------------------------------------------------------------------

const PLACEHOLDER_TYPES = new Set([
  "text",
  "textarea",
  "select",
  "number",
  "conditional",
]);
const OPTION_TYPES = new Set(["select", "multiselect", "radio"]);

function OptionsEditor({ field }: { field: FormField }) {
  const updateField = useBuilderStore((s) => s.updateField);
  const options = field.options ?? [];

  const setOptions = (next: FormField["options"]) =>
    updateField(field.id, { options: next });

  const updateLabel = (index: number, label: string) => {
    setOptions(
      options.map((option, i) =>
        i === index ? { ...option, label } : option,
      ),
    );
  };

  const addOption = () => {
    const label = `Option ${options.length + 1}`;
    const base = slugify(label) || "option";
    const taken = new Set(options.map((o) => o.value));
    let value = base;
    while (taken.has(value)) value = `${base}_${uid("").slice(1, 5)}`;
    setOptions([...options, { label, value }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">Options</Label>
      {options.map((option, index) => (
        <div key={option.value} className="flex items-center gap-1.5">
          <Input
            value={option.label}
            aria-label={`Option ${index + 1} label`}
            onChange={(e) => updateLabel(index, e.target.value)}
            className="h-9"
          />
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            aria-label={`Remove option ${option.label}`}
            onClick={() => removeOption(index)}
            className="shrink-0 hover:bg-crimson hover:text-white"
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addOption}>
        <Plus />
        Add option
      </Button>
    </div>
  );
}

function ContentTab({ field }: { field: FormField }) {
  const updateField = useBuilderStore((s) => s.updateField);

  return (
    <div className="space-y-4">
      <TextSetting
        id="edit-label"
        label={field.type === "section" ? "Heading" : "Label"}
        value={field.label}
        onCommit={(label) => updateField(field.id, { label })}
      />
      {PLACEHOLDER_TYPES.has(field.type) && (
        <TextSetting
          id="edit-placeholder"
          label="Placeholder"
          value={field.placeholder ?? ""}
          onCommit={(placeholder) => updateField(field.id, { placeholder })}
        />
      )}
      <TextSetting
        id="edit-help"
        label={field.type === "section" ? "Description" : "Help text"}
        value={field.helpText ?? ""}
        onCommit={(helpText) => updateField(field.id, { helpText })}
      />
      {OPTION_TYPES.has(field.type) && <OptionsEditor field={field} />}
      {field.type === "file" && (
        <>
          <TextSetting
            id="edit-accept"
            label="Accepted types (e.g. image/*,.pdf)"
            value={field.accept ?? ""}
            onCommit={(accept) => updateField(field.id, { accept })}
          />
          <div className="space-y-1.5">
            <Label htmlFor="edit-maxsize" className="text-xs">
              Max size per file (MB)
            </Label>
            <Input
              id="edit-maxsize"
              type="number"
              min={1}
              value={field.maxSizeMB ?? ""}
              onChange={(e) =>
                updateField(field.id, {
                  maxSizeMB: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className="h-9"
            />
          </div>
        </>
      )}
      {field.type === "number" && (
        <div className="space-y-1.5">
          <Label htmlFor="edit-step" className="text-xs">
            Step
          </Label>
          <Input
            id="edit-step"
            type="number"
            min={0}
            value={field.step ?? ""}
            onChange={(e) =>
              updateField(field.id, {
                step: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="h-9"
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Validation tab
// ---------------------------------------------------------------------------

type RuleType = ValidationRule["type"];

const RULE_LABELS: Record<RuleType, string> = {
  required: "Required (custom message)",
  minLength: "Min length",
  maxLength: "Max length",
  min: "Min value",
  max: "Max value",
  pattern: "Regex pattern",
  email: "Email format",
  url: "URL format",
};

function applicableRules(field: FormField): RuleType[] {
  switch (field.type) {
    case "text":
    case "textarea":
    case "conditional":
      return ["required", "minLength", "maxLength", "pattern", "email", "url"];
    case "number":
      return ["required", "min", "max"];
    case "date":
      return ["required", "min", "max"];
    case "multiselect":
      return ["required", "min", "max"];
    case "select":
    case "radio":
    case "checkbox":
    case "rating":
    case "file":
      return ["required"];
    case "section":
      return [];
  }
}

function ruleNeedsValue(type: RuleType): boolean {
  return ["minLength", "maxLength", "min", "max", "pattern"].includes(type);
}

function ruleValueInputType(field: FormField, type: RuleType): string {
  if (type === "pattern") return "text";
  if (field.type === "date") return "date";
  return "number";
}

function defaultMessage(field: FormField, type: RuleType): string {
  const name = field.label || "This field";
  switch (type) {
    case "required":
      return `${name} is required`;
    case "minLength":
      return "Too short";
    case "maxLength":
      return "Too long";
    case "min":
      return "Value is too low";
    case "max":
      return "Value is too high";
    case "pattern":
      return "Invalid format";
    case "email":
      return "Enter a valid email address";
    case "url":
      return "Enter a valid URL";
  }
}

function ValidationTab({ field }: { field: FormField }) {
  const updateField = useBuilderStore((s) => s.updateField);
  const ruleTypes = applicableRules(field);

  const setRules = (validations: ValidationRule[]) =>
    updateField(field.id, { validations });

  const updateRule = (index: number, updates: Partial<ValidationRule>) => {
    setRules(
      field.validations.map((rule, i) =>
        i === index ? { ...rule, ...updates } : rule,
      ),
    );
  };

  const addRule = () => {
    const used = new Set(field.validations.map((r) => r.type));
    const type =
      ruleTypes.find((t) => !used.has(t) && t !== "required") ??
      ruleTypes.find((t) => !used.has(t)) ??
      ruleTypes[0];
    if (!type) return;
    setRules([
      ...field.validations,
      { type, value: ruleNeedsValue(type) ? "" : undefined, message: defaultMessage(field, type) },
    ]);
  };

  if (field.type === "section") {
    return (
      <p className="text-sm text-foreground/60">
        Section breaks are visual only — nothing to validate.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 border-2 border-line bg-surface px-3 py-2.5">
        <Label htmlFor="edit-required" className="text-xs">
          Required field
        </Label>
        <Switch
          id="edit-required"
          checked={field.required}
          onCheckedChange={(required) => updateField(field.id, { required })}
        />
      </div>

      <div className="space-y-3">
        {field.validations.map((rule, index) => (
          <div
            key={index}
            className="space-y-2 border-2 border-line bg-surface p-2.5"
          >
            <div className="flex items-center gap-1.5">
              <SelectSetting
                value={rule.type}
                ariaLabel={`Rule ${index + 1} type`}
                onChange={(type) =>
                  updateRule(index, {
                    type: type as RuleType,
                    value: ruleNeedsValue(type as RuleType) ? "" : undefined,
                    message: defaultMessage(field, type as RuleType),
                  })
                }
                options={ruleTypes.map((t) => ({
                  label: RULE_LABELS[t],
                  value: t,
                }))}
              />
              <Button
                type="button"
                variant="ghost"
                size="iconSm"
                aria-label={`Remove rule ${index + 1}`}
                onClick={() =>
                  setRules(field.validations.filter((_, i) => i !== index))
                }
                className="shrink-0 hover:bg-crimson hover:text-white"
              >
                <Trash2 />
              </Button>
            </div>

            {ruleNeedsValue(rule.type) && (
              <Input
                type={ruleValueInputType(field, rule.type)}
                value={rule.value === undefined ? "" : String(rule.value)}
                aria-label={`Rule ${index + 1} value`}
                placeholder={rule.type === "pattern" ? "^[a-z]+$" : "Value"}
                onChange={(e) => {
                  const raw = e.target.value;
                  const numeric =
                    ruleValueInputType(field, rule.type) === "number";
                  updateRule(index, {
                    value: numeric && raw !== "" ? Number(raw) : raw,
                  });
                }}
                className="h-9"
              />
            )}

            <Input
              value={rule.message}
              aria-label={`Rule ${index + 1} error message`}
              placeholder="Error message"
              onChange={(e) => updateRule(index, { message: e.target.value })}
              className="h-9"
            />
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addRule}>
        <Plus />
        Add validation rule
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conditional tab
// ---------------------------------------------------------------------------

const OPERATORS: { label: string; value: ConditionalLogic["operator"] }[] = [
  { label: "equals", value: "equals" },
  { label: "does not equal", value: "not_equals" },
  { label: "contains", value: "contains" },
  { label: "is empty", value: "is_empty" },
  { label: "is not empty", value: "is_not_empty" },
];

function ConditionalTab({ field }: { field: FormField }) {
  const updateField = useBuilderStore((s) => s.updateField);
  const allFields = useBuilderStore((s) => s.form.fields);
  const sources = allFields.filter(
    (f) => f.id !== field.id && f.type !== "section",
  );

  const rule = field.conditional;

  const setRule = (conditional: ConditionalLogic | undefined) =>
    updateField(field.id, { conditional });

  if (field.type === "section") {
    return (
      <p className="text-sm text-foreground/60">
        Conditional logic isn&apos;t available on section breaks.
      </p>
    );
  }

  if (sources.length === 0) {
    return (
      <p className="text-sm text-foreground/60">
        Add at least one other field first — conditional rules react to another
        field&apos;s answer.
      </p>
    );
  }

  if (!rule) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-foreground/60">
          Show or hide this field based on another field&apos;s live answer.
        </p>
        <Button
          type="button"
          variant="brand"
          size="sm"
          onClick={() =>
            setRule({
              fieldId: sources[0]!.id,
              operator: "equals",
              value: "",
              action: "show",
            })
          }
        >
          <Plus />
          Add condition
        </Button>
      </div>
    );
  }

  const needsValue =
    rule.operator !== "is_empty" && rule.operator !== "is_not_empty";

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Action</Label>
        <SegmentedToggle
          ariaLabel="Conditional action"
          value={rule.action}
          onChange={(action) => setRule({ ...rule, action })}
          options={[
            { label: "Show when", value: "show" },
            { label: "Hide when", value: "hide" },
          ]}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Watch field</Label>
        <SelectSetting
          value={rule.fieldId}
          ariaLabel="Field to watch"
          onChange={(fieldId) => setRule({ ...rule, fieldId })}
          options={sources.map((f) => ({
            label: f.label || f.id,
            value: f.id,
          }))}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Operator</Label>
        <SelectSetting
          value={rule.operator}
          ariaLabel="Comparison operator"
          onChange={(operator) =>
            setRule({
              ...rule,
              operator: operator as ConditionalLogic["operator"],
            })
          }
          options={OPERATORS}
        />
      </div>

      {needsValue && (
        <TextSetting
          id="edit-cond-value"
          label="Comparison value"
          value={rule.value}
          onCommit={(value) => setRule({ ...rule, value })}
          placeholder="Value to compare against"
        />
      )}

      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => setRule(undefined)}
      >
        <Trash2 />
        Remove condition
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Appearance tab
// ---------------------------------------------------------------------------

function AppearanceTab({ field }: { field: FormField }) {
  const updateField = useBuilderStore((s) => s.updateField);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Field width</Label>
        <SegmentedToggle
          ariaLabel="Field width"
          value={field.width}
          onChange={(width) => updateField(field.id, { width })}
          options={[
            { label: "Full", value: "full" },
            { label: "Half", value: "half" },
          ]}
        />
      </div>

      {field.type === "radio" && (
        <div className="space-y-1.5">
          <Label className="text-xs">Option layout</Label>
          <SegmentedToggle
            ariaLabel="Radio layout"
            value={field.layout ?? "vertical"}
            onChange={(layout) => updateField(field.id, { layout })}
            options={[
              { label: "Vertical", value: "vertical" },
              { label: "Horizontal", value: "horizontal" },
            ]}
          />
        </div>
      )}

      {field.type === "textarea" && (
        <div className="space-y-1.5">
          <Label htmlFor="edit-rows" className="text-xs">
            Rows
          </Label>
          <Input
            id="edit-rows"
            type="number"
            min={2}
            max={20}
            value={field.rows ?? 4}
            onChange={(e) =>
              updateField(field.id, {
                rows: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="h-9"
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

function EditorPanel({ field }: { field: FormField }) {
  const selectField = useBuilderStore((s) => s.selectField);
  const definition = FIELD_REGISTRY[field.type];
  const Icon = FIELD_ICONS[definition.icon];

  return (
    <motion.aside
      initial={{ x: 380 }}
      animate={{ x: 0 }}
      exit={{ x: 380 }}
      transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
      aria-label={`Edit ${field.label}`}
      className="flex w-[340px] shrink-0 flex-col border-l-2 border-line bg-background max-md:fixed max-md:inset-y-0 max-md:right-0 max-md:z-40 max-md:w-full max-md:max-w-sm"
    >
      <header className="flex items-center justify-between gap-2 border-b-2 border-line bg-brand px-4 py-3 text-ink">
        <span className="flex min-w-0 items-center gap-2">
          <Icon className="size-4 shrink-0" />
          <span className="truncate font-display text-sm font-bold uppercase tracking-wide">
            {definition.label}
          </span>
        </span>
        <button
          type="button"
          onClick={() => selectField(null)}
          aria-label="Close field editor"
          className="rounded-sm p-1 transition-colors focus-hard hover:bg-ink hover:text-brand"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="validation">Rules</TabsTrigger>
            <TabsTrigger value="conditional">Logic</TabsTrigger>
            <TabsTrigger value="appearance">Style</TabsTrigger>
          </TabsList>
          <TabsContent value="content">
            <ContentTab field={field} />
          </TabsContent>
          <TabsContent value="validation">
            <ValidationTab field={field} />
          </TabsContent>
          <TabsContent value="conditional">
            <ConditionalTab field={field} />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceTab field={field} />
          </TabsContent>
        </Tabs>
      </div>
    </motion.aside>
  );
}

/** Right panel — appears when a field is selected, slides in from the right. */
export function FieldEditor() {
  const selectedField = useBuilderStore(
    (s) => s.form.fields.find((f) => f.id === s.selectedFieldId) ?? null,
  );

  return (
    <AnimatePresence>
      {selectedField && (
        <EditorPanel key={selectedField.id} field={selectedField} />
      )}
    </AnimatePresence>
  );
}
