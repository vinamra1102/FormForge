import type { FormField, FormSchema } from "@/types";

export const SITE_URL = "https://formforge-three-lake.vercel.app";

/** Clean, pretty-printed JSON export of the form schema. */
export function toJSONSchema(form: FormSchema): string {
  return JSON.stringify(form, null, 2);
}

/**
 * Embeddable snippet: a mount node, the schema as inline JSON, and the
 * FormForge embed runtime which renders the form into the mount node.
 */
export function toEmbedCode(form: FormSchema): string {
  // `</` must be escaped so the inline JSON cannot close the script tag early.
  const json = JSON.stringify(form).replace(/<\//g, "<\\/");
  return [
    `<!-- FormForge embed · ${form.title} -->`,
    `<div data-formforge="${form.id}"></div>`,
    `<script type="application/json" data-formforge-schema="${form.id}">`,
    json,
    `</script>`,
    `<script async src="${SITE_URL}/embed.js" data-formforge-id="${form.id}"></script>`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// React component generation
// ---------------------------------------------------------------------------

const q = (value: string) => JSON.stringify(value ?? "");

function isRequired(field: FormField): boolean {
  return field.required || field.validations.some((r) => r.type === "required");
}

function requiredMessage(field: FormField): string {
  const custom = field.validations.find((r) => r.type === "required");
  return custom?.message || `${field.label || "This field"} is required`;
}

/** Build the Zod expression source for one field. */
function zodExpression(field: FormField): string {
  const required = isRequired(field);
  const reqMsg = q(requiredMessage(field));

  const stringChains = () => {
    let expr = "z.string()";
    for (const rule of field.validations) {
      const msg = q(rule.message);
      switch (rule.type) {
        case "minLength":
          expr += `.min(${Number(rule.value ?? 0)}, ${msg})`;
          break;
        case "maxLength":
          expr += `.max(${Number(rule.value ?? 0)}, ${msg})`;
          break;
        case "pattern":
          if (rule.value)
            expr += `.regex(new RegExp(${q(String(rule.value))}), ${msg})`;
          break;
        case "email":
          expr += `.email(${msg})`;
          break;
        case "url":
          expr += `.url(${msg})`;
          break;
        default:
          break;
      }
    }
    return expr;
  };

  switch (field.type) {
    case "text":
    case "textarea":
    case "conditional":
    case "select":
    case "radio": {
      const base = stringChains();
      return required
        ? `${base}.min(1, ${reqMsg})`
        : `z.union([z.literal(""), ${base}]).optional()`;
    }
    case "date": {
      let expr = "z.string()";
      for (const rule of field.validations) {
        const msg = q(rule.message);
        if (rule.type === "min" && rule.value)
          expr += `.refine((v) => v === "" || v >= ${q(String(rule.value))}, ${msg})`;
        if (rule.type === "max" && rule.value)
          expr += `.refine((v) => v === "" || v <= ${q(String(rule.value))}, ${msg})`;
      }
      return required ? `z.string().min(1, ${reqMsg}).pipe(${expr})` : `${expr}.optional()`;
    }
    case "number": {
      let inner = `z.number({ required_error: ${reqMsg}, invalid_type_error: ${q(
        `${field.label || "This field"} must be a number`,
      )} })`;
      for (const rule of field.validations) {
        const msg = q(rule.message);
        if (rule.type === "min") inner += `.min(${Number(rule.value ?? 0)}, ${msg})`;
        if (rule.type === "max") inner += `.max(${Number(rule.value ?? 0)}, ${msg})`;
      }
      if (!required) inner += ".optional()";
      return `z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), ${inner})`;
    }
    case "multiselect": {
      let expr = "z.array(z.string())";
      if (required) expr += `.min(1, ${reqMsg})`;
      return expr;
    }
    case "checkbox":
      return required
        ? `z.boolean().refine((v) => v === true, ${reqMsg})`
        : "z.boolean().optional()";
    case "rating": {
      const inner = required
        ? `z.number().int().min(1, ${reqMsg}).max(5)`
        : "z.number().int().max(5).optional()";
      return `z.preprocess((v) => (v === 0 || v == null ? undefined : v), ${inner})`;
    }
    case "file": {
      let expr = "z.any()";
      if (required)
        expr += `.refine((files) => files && files.length > 0, ${reqMsg})`;
      if (field.maxSizeMB)
        expr += `.refine((files) => !files || Array.from(files as FileList).every((f) => f.size <= ${
          field.maxSizeMB
        } * 1024 * 1024), ${q(`Each file must be under ${field.maxSizeMB}MB`)})`;
      return expr;
    }
    case "section":
      return "z.any()";
  }
}

function defaultValueExpression(field: FormField): string {
  switch (field.type) {
    case "multiselect":
      return "[]";
    case "checkbox":
      return "false";
    case "rating":
      return "0";
    case "file":
      return "undefined";
    default:
      return '""';
  }
}

const errorLine = (id: string) =>
  `        {errors[${q(id)}] && <p className="ff-error">{String(errors[${q(
    id,
  )}]?.message)}</p>}`;

/** JSX for one field inside the generated component. */
function fieldJSX(field: FormField): string {
  const id = field.id;
  const label = `        <label htmlFor=${q(id)}>${escapeJSXText(field.label)}${
    isRequired(field) ? " *" : ""
  }</label>`;
  const help = field.helpText
    ? `        <p className="ff-help">${escapeJSXText(field.helpText)}</p>`
    : null;

  const lines: string[] = [`      <div className="ff-field">`];

  switch (field.type) {
    case "section":
      return [
        `      <div className="ff-section">`,
        `        <h2>${escapeJSXText(field.label)}</h2>`,
        ...(field.helpText
          ? [`        <p>${escapeJSXText(field.helpText)}</p>`]
          : []),
        `      </div>`,
      ].join("\n");
    case "text":
    case "conditional":
      lines.push(
        label,
        `        <input id=${q(id)} type="text" placeholder=${q(
          field.placeholder ?? "",
        )} {...register(${q(id)})} />`,
      );
      break;
    case "textarea":
      lines.push(
        label,
        `        <textarea id=${q(id)} rows={${field.rows ?? 4}} placeholder=${q(
          field.placeholder ?? "",
        )} {...register(${q(id)})} />`,
      );
      break;
    case "select": {
      const options = (field.options ?? [])
        .map(
          (o) =>
            `          <option value=${q(o.value)}>${escapeJSXText(o.label)}</option>`,
        )
        .join("\n");
      lines.push(
        label,
        `        <select id=${q(id)} {...register(${q(id)})}>`,
        `          <option value="">${escapeJSXText(
          field.placeholder || "Select…",
        )}</option>`,
        options,
        `        </select>`,
      );
      break;
    }
    case "radio": {
      const radios = (field.options ?? [])
        .map(
          (o) =>
            `          <label className="ff-option"><input type="radio" value=${q(
              o.value,
            )} {...register(${q(id)})} /> ${escapeJSXText(o.label)}</label>`,
        )
        .join("\n");
      lines.push(label, `        <div className="ff-options">`, radios, `        </div>`);
      break;
    }
    case "multiselect": {
      const boxes = (field.options ?? [])
        .map(
          (o) =>
            `          <label className="ff-option"><input type="checkbox" value=${q(
              o.value,
            )} {...register(${q(id)})} /> ${escapeJSXText(o.label)}</label>`,
        )
        .join("\n");
      lines.push(label, `        <div className="ff-options">`, boxes, `        </div>`);
      break;
    }
    case "checkbox":
      lines.push(
        `        <label className="ff-option"><input type="checkbox" {...register(${q(
          id,
        )})} /> ${escapeJSXText(field.label)}${isRequired(field) ? " *" : ""}</label>`,
      );
      break;
    case "date": {
      const min = field.validations.find((r) => r.type === "min")?.value;
      const max = field.validations.find((r) => r.type === "max")?.value;
      lines.push(
        label,
        `        <input id=${q(id)} type="date"${
          min ? ` min=${q(String(min))}` : ""
        }${max ? ` max=${q(String(max))}` : ""} {...register(${q(id)})} />`,
      );
      break;
    }
    case "number": {
      const min = field.validations.find((r) => r.type === "min")?.value;
      const max = field.validations.find((r) => r.type === "max")?.value;
      lines.push(
        label,
        `        <input id=${q(id)} type="number"${
          min !== undefined ? ` min={${Number(min)}}` : ""
        }${max !== undefined ? ` max={${Number(max)}}` : ""} step={${
          field.step ?? 1
        }} placeholder=${q(field.placeholder ?? "")} {...register(${q(id)})} />`,
      );
      break;
    }
    case "rating":
      lines.push(
        label,
        `        <div className="ff-rating" role="radiogroup" aria-label=${q(
          field.label,
        )}>`,
        `          {[1, 2, 3, 4, 5].map((star) => (`,
        `            <button key={star} type="button" aria-label={\`\${star} star\${star > 1 ? "s" : ""}\`} onClick={() => setValue(${q(
          id,
        )}, star, { shouldValidate: true })}>`,
        `              {star <= (watch(${q(id)}) ?? 0) ? "★" : "☆"}`,
        `            </button>`,
        `          ))}`,
        `        </div>`,
      );
      break;
    case "file":
      lines.push(
        label,
        `        <input id=${q(id)} type="file"${
          field.accept ? ` accept=${q(field.accept)}` : ""
        } {...register(${q(id)})} />`,
      );
      break;
  }

  if (help) lines.push(help);
  lines.push(errorLine(id), `      </div>`);

  const jsx = lines.join("\n");

  if (field.conditional?.fieldId) {
    const c = field.conditional;
    const visible = `checkCondition(values[${q(c.fieldId)}], ${q(c.operator)}, ${q(
      c.value,
    )})`;
    const test = c.action === "show" ? visible : `!${visible}`;
    return [`      {${test} && (`, indent(jsx, 2), `      )}`].join("\n");
  }
  return jsx;
}

function escapeJSXText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");
}

function indent(block: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return block
    .split("\n")
    .map((line) => (line.trim() ? pad + line : line))
    .join("\n");
}

function componentName(form: FormSchema): string {
  const cleaned = form.title
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join("");
  return /^[A-Za-z]/.test(cleaned) && cleaned ? `${cleaned}Form` : "GeneratedForm";
}

/**
 * Generate a complete, self-contained React component (React Hook Form + Zod)
 * from the form schema. The output is valid TypeScript.
 */
export function toReactCode(form: FormSchema): string {
  const fields = [...form.fields].sort((a, b) => a.order - b.order);
  const dataFields = fields.filter((f) => f.type !== "section");
  const name = componentName(form);
  const hasConditional = fields.some((f) => f.conditional?.fieldId);
  const hasRating = fields.some((f) => f.type === "rating");

  const schemaLines = dataFields
    .map((f) => `  ${q(f.id)}: ${zodExpression(f)},`)
    .join("\n");

  const defaultLines = dataFields
    .map((f) => `      ${q(f.id)}: ${defaultValueExpression(f)},`)
    .join("\n");

  const conditionHelper = hasConditional
    ? `
function checkCondition(
  raw: unknown,
  operator: "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty",
  target: string,
): boolean {
  const value =
    raw == null
      ? ""
      : typeof raw === "boolean"
        ? raw
          ? "true"
          : ""
        : Array.isArray(raw)
          ? raw.map(String).join(",")
          : String(raw);
  const empty =
    raw == null ||
    raw === false ||
    (Array.isArray(raw) && raw.length === 0) ||
    String(value).trim() === "";
  switch (operator) {
    case "equals":
      return value === target;
    case "not_equals":
      return value !== target;
    case "contains":
      return Array.isArray(raw)
        ? raw.map(String).includes(target)
        : value.includes(target);
    case "is_empty":
      return empty;
    case "is_not_empty":
      return !empty;
  }
}
`
    : "";

  const watchAll = hasConditional ? `  const values = watch();\n` : "";
  const destructure = ["register", "handleSubmit"];
  if (hasConditional || hasRating) destructure.push("watch");
  if (hasRating) destructure.push("setValue");

  return `"use client";

// Generated by FormForge — ${form.title}
// ${SITE_URL}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
${schemaLines}
});

type FormValues = z.infer<typeof schema>;
${conditionHelper}
export default function ${name}() {
  const {
    ${destructure.join(",\n    ")},
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
${defaultLines}
    },
  });
${watchAll}
  const onSubmit = (data: FormValues) => {
    // Wire this up to your API endpoint.
    console.log("${form.title} submission:", data);
  };

  if (isSubmitSuccessful) {
    return <p className="ff-success">${escapeJSXText(
      form.settings.successMessage,
    )}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1>${escapeJSXText(form.title)}</h1>
${form.description ? `      <p>${escapeJSXText(form.description)}</p>\n` : ""}${fields
    .map(fieldJSX)
    .join("\n")}
      <button type="submit" disabled={isSubmitting}>
        ${escapeJSXText(form.settings.submitLabel)}
      </button>
    </form>
  );
}
`;
}
