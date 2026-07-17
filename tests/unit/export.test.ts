import { describe, expect, it } from "vitest";
import ts from "typescript";
import type { FormSchema } from "@/types";
import {
  decodeSchemaFromURL,
  encodeSchemaToURL,
  toEmbedCode,
  toJSONSchema,
  toReactCode,
} from "@/lib/export";
import { createEmptyForm, createField } from "@/lib/store";

function sampleForm(): FormSchema {
  const form = createEmptyForm("contact");
  form.title = "Contact Us";
  form.description = "We reply within a day.";

  const name = createField("text", 0);
  name.label = "Full name";
  name.required = true;
  name.validations = [{ type: "minLength", value: 2, message: "Too short" }];

  const email = createField("text", 1);
  email.label = "Email";
  email.validations = [{ type: "email", message: "Invalid email" }];

  const topic = createField("select", 2);
  topic.label = "Topic";

  const other = createField("text", 3);
  other.label = "Other topic";
  other.conditional = {
    fieldId: topic.id,
    operator: "equals",
    value: "option_3",
    action: "show",
  };

  const rating = createField("rating", 4);
  rating.label = "How did we do?";
  rating.required = true;

  const section = createField("section", 5);
  const upload = createField("file", 6);
  const agree = createField("checkbox", 7);
  agree.required = true;

  form.fields = [name, email, topic, other, rating, section, upload, agree];
  return form;
}

describe("toJSONSchema", () => {
  it("round-trips through JSON.parse", () => {
    const form = sampleForm();
    expect(JSON.parse(toJSONSchema(form))).toEqual(form);
  });
});

describe("toEmbedCode", () => {
  it("contains the mount node, inline schema, and runtime script", () => {
    const form = sampleForm();
    const embed = toEmbedCode(form);
    expect(embed).toContain(`<div data-formforge="${form.id}"></div>`);
    expect(embed).toContain(`data-formforge-schema="${form.id}"`);
    expect(embed).toContain("/embed.js");
    expect(embed).toContain(form.title);
  });

  it("escapes </script> sequences inside the inline JSON", () => {
    const form = sampleForm();
    form.description = "sneaky </script><script>alert(1)</script>";
    const embed = toEmbedCode(form);
    expect(embed).not.toContain("</script><script>alert(1)");
    expect(embed).toContain("<\\/script>");
  });
});

describe("toReactCode", () => {
  it("generates a client component wired to RHF + Zod", () => {
    const code = toReactCode(sampleForm());
    expect(code).toContain('"use client"');
    expect(code).toContain("export default function ContactUsForm()");
    expect(code).toContain("useForm<FormValues>");
    // The sample form has a conditional field → visibility-aware resolver.
    expect(code).toContain("const fieldSchemas = {");
    expect(code).toContain("resolver: dynamicResolver");
    expect(code).toContain("function buildSchema(");
  });

  it("uses a plain static schema when no conditionals exist", () => {
    const plain = createEmptyForm("plain");
    plain.fields = [createField("text", 0)];
    const code = toReactCode(plain);
    expect(code).toContain("const schema = z.object({");
    expect(code).toContain("resolver: zodResolver(schema)");
    expect(code).not.toContain("dynamicResolver");
  });

  it("emits quotes in attribute values inside expression containers", () => {
    const form = createEmptyForm("attrs");
    const field = createField("text", 0);
    field.placeholder = 'Say "hello" friend';
    form.fields = [field];
    const code = toReactCode(form);
    // JSX string attributes can't hold escaped quotes — must be {"…"}.
    expect(code).toContain('placeholder={"Say \\"hello\\" friend"}');
  });

  it("includes every data field and skips section data", () => {
    const form = sampleForm();
    const code = toReactCode(form);
    for (const field of form.fields) {
      if (field.type === "section") continue;
      expect(code).toContain(JSON.stringify(field.id));
    }
  });

  it("emits the conditional helper only when needed", () => {
    const withConditional = toReactCode(sampleForm());
    expect(withConditional).toContain("function checkCondition(");
    expect(withConditional).toContain("const values = watch();");

    const plain = createEmptyForm("plain");
    plain.fields = [createField("text", 0)];
    const withoutConditional = toReactCode(plain);
    expect(withoutConditional).not.toContain("function checkCondition(");
  });

  it("escapes quotes and braces in user-supplied labels", () => {
    const form = createEmptyForm("tricky");
    const field = createField("text", 0);
    field.label = 'Say "hi" {now} <b>';
    field.required = true;
    form.fields = [field];
    const code = toReactCode(form);
    expect(code).toContain("&#123;now&#125;");
    expect(code).toContain("&lt;b&gt;");
    expect(code).toContain('\\"hi\\"');
  });

  it("produces syntactically valid TypeScript", () => {
    const code = toReactCode(sampleForm());
    const result = ts.transpileModule(code, {
      fileName: "GeneratedForm.tsx",
      compilerOptions: {
        jsx: ts.JsxEmit.Preserve,
        target: ts.ScriptTarget.ES2022,
      },
      reportDiagnostics: true,
    });
    expect(result.diagnostics ?? []).toEqual([]);
  });

  it("falls back to a safe component name for odd titles", () => {
    const form = createEmptyForm("odd");
    form.title = "123 !!!";
    expect(toReactCode(form)).toContain("function GeneratedForm()");
  });
});

describe("shareable URL codec", () => {
  it("round-trips a schema through encode → decode", () => {
    const form = sampleForm();
    const url = encodeSchemaToURL(form);
    expect(url).not.toBeNull();
    const encoded = new URL(url!).searchParams.get("s")!;
    expect(decodeSchemaFromURL(encoded)).toEqual(form);
  });

  it("returns null for URLs that would be too long", () => {
    const form = createEmptyForm("huge");
    for (let i = 0; i < 400; i++) {
      const field = createField("text", i);
      field.label = `Question ${i} — ${"x".repeat(60)}-${i}`;
      field.helpText = `${Math.sin(i)}`.repeat(4);
      form.fields.push(field);
    }
    expect(encodeSchemaToURL(form)).toBeNull();
  });

  it("still decodes legacy plain-base64url payloads", () => {
    // Legacy links were plain btoa (Latin-1 only) — mirror that constraint.
    const form = createEmptyForm("legacy");
    const field = createField("text", 0);
    field.placeholder = "Plain ASCII placeholder";
    form.fields = [field];
    const legacy = btoa(JSON.stringify(form))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
    expect(decodeSchemaFromURL(legacy)).toEqual(form);
  });

  it("rejects garbage input", () => {
    expect(decodeSchemaFromURL("not-a-real-payload")).toBeNull();
  });
});
