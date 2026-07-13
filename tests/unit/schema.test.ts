import { describe, expect, it } from "vitest";
import {
  conditionalLogicSchema,
  fieldSchema,
  formSchema,
  safeParseFormSchema,
  validationRuleSchema,
} from "@/lib/schema";
import { createEmptyForm, createField } from "@/lib/store";

describe("validationRuleSchema", () => {
  it("accepts valid rules with string or number values", () => {
    expect(
      validationRuleSchema.safeParse({
        type: "minLength",
        value: 3,
        message: "Too short",
      }).success,
    ).toBe(true);
    expect(
      validationRuleSchema.safeParse({
        type: "pattern",
        value: "^a",
        message: "Bad",
      }).success,
    ).toBe(true);
    expect(
      validationRuleSchema.safeParse({ type: "email", message: "Bad" })
        .success,
    ).toBe(true);
  });

  it("rejects unknown rule types and missing messages", () => {
    expect(
      validationRuleSchema.safeParse({ type: "banana", message: "x" }).success,
    ).toBe(false);
    expect(validationRuleSchema.safeParse({ type: "email" }).success).toBe(
      false,
    );
  });
});

describe("conditionalLogicSchema", () => {
  it("round-trips a valid rule", () => {
    const rule = {
      fieldId: "abc",
      operator: "equals",
      value: "yes",
      action: "show",
    };
    expect(conditionalLogicSchema.safeParse(rule).success).toBe(true);
  });

  it("rejects invalid operators and actions", () => {
    expect(
      conditionalLogicSchema.safeParse({
        fieldId: "abc",
        operator: "≈",
        value: "",
        action: "show",
      }).success,
    ).toBe(false);
    expect(
      conditionalLogicSchema.safeParse({
        fieldId: "abc",
        operator: "equals",
        value: "",
        action: "explode",
      }).success,
    ).toBe(false);
  });
});

describe("fieldSchema", () => {
  it("accepts every field the registry can create", () => {
    const types = [
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
    ] as const;
    for (const type of types) {
      const field = createField(type, 0);
      const result = fieldSchema.safeParse(field);
      expect(result.success, `${type} should validate`).toBe(true);
    }
  });

  it("rejects bad widths, negative order, and unknown types", () => {
    const base = createField("text", 0);
    expect(fieldSchema.safeParse({ ...base, width: "third" }).success).toBe(
      false,
    );
    expect(fieldSchema.safeParse({ ...base, order: -1 }).success).toBe(false);
    expect(fieldSchema.safeParse({ ...base, type: "magic" }).success).toBe(
      false,
    );
  });
});

describe("formSchema", () => {
  it("accepts a complete form", () => {
    const form = createEmptyForm("f1");
    form.fields = [createField("text", 0), createField("select", 1)];
    expect(formSchema.safeParse(form).success).toBe(true);
  });

  it("rejects a form without a title or with bad settings", () => {
    const form = createEmptyForm("f1");
    expect(safeParseFormSchema({ ...form, title: "" }).success).toBe(false);
    expect(
      safeParseFormSchema({
        ...form,
        settings: { ...form.settings, theme: "neon" },
      }).success,
    ).toBe(false);
    expect(safeParseFormSchema("not an object").success).toBe(false);
  });
});
