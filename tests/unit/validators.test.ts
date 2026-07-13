import { describe, expect, it } from "vitest";
import type { FormField } from "@/types";
import {
  buildZodSchema,
  fieldIsRequired,
  getDefaultValues,
  isFieldVisible,
} from "@/lib/validators";

let counter = 0;
function makeField(overrides: Partial<FormField> = {}): FormField {
  counter += 1;
  return {
    id: overrides.id ?? `f${counter}`,
    type: "text",
    label: "Field",
    required: false,
    validations: [],
    width: "full",
    order: 0,
    ...overrides,
  };
}

describe("buildZodSchema", () => {
  it("requires non-empty strings with the custom message", () => {
    const field = makeField({ id: "name", required: true, label: "Name" });
    const schema = buildZodSchema([field]);
    const fail = schema.safeParse({ name: "" });
    expect(fail.success).toBe(false);
    if (!fail.success) {
      expect(fail.error.issues[0]!.message).toBe("Name is required");
    }
    expect(schema.safeParse({ name: "Ada" }).success).toBe(true);
  });

  it("honours a required rule's custom message", () => {
    const field = makeField({
      id: "name",
      validations: [{ type: "required", message: "Give us a name!" }],
    });
    const result = buildZodSchema([field]).safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe("Give us a name!");
    }
  });

  it("allows empty optional strings but validates real input", () => {
    const field = makeField({
      id: "email",
      validations: [{ type: "email", message: "Bad email" }],
    });
    const schema = buildZodSchema([field]);
    expect(schema.safeParse({ email: "" }).success).toBe(true);
    expect(schema.safeParse({ email: "not-an-email" }).success).toBe(false);
    expect(schema.safeParse({ email: "a@b.co" }).success).toBe(true);
  });

  it("applies minLength / maxLength / pattern / url rules", () => {
    const field = makeField({
      id: "code",
      required: true,
      validations: [
        { type: "minLength", value: 3, message: "min3" },
        { type: "maxLength", value: 5, message: "max5" },
        { type: "pattern", value: "^[a-z]+$", message: "lowercase" },
      ],
    });
    const schema = buildZodSchema([field]);
    expect(schema.safeParse({ code: "ab" }).success).toBe(false);
    expect(schema.safeParse({ code: "abcdef" }).success).toBe(false);
    expect(schema.safeParse({ code: "ABC" }).success).toBe(false);
    expect(schema.safeParse({ code: "abcd" }).success).toBe(true);

    const url = makeField({
      id: "site",
      validations: [{ type: "url", message: "Bad URL" }],
    });
    const urlSchema = buildZodSchema([url]);
    expect(urlSchema.safeParse({ site: "nope" }).success).toBe(false);
    expect(urlSchema.safeParse({ site: "https://a.dev" }).success).toBe(true);
  });

  it("skips invalid user-supplied regex instead of crashing", () => {
    const field = makeField({
      id: "x",
      validations: [{ type: "pattern", value: "([", message: "bad" }],
    });
    expect(() => buildZodSchema([field]).parse({ x: "anything" })).not.toThrow();
  });

  it("coerces number input strings and applies min/max", () => {
    const field = makeField({
      id: "age",
      type: "number",
      required: true,
      validations: [
        { type: "min", value: 18, message: "too young" },
        { type: "max", value: 99, message: "too old" },
      ],
    });
    const schema = buildZodSchema([field]);
    expect(schema.safeParse({ age: "" }).success).toBe(false);
    expect(schema.safeParse({ age: "17" }).success).toBe(false);
    expect(schema.safeParse({ age: "42" }).success).toBe(true);
    expect(schema.safeParse({ age: 120 }).success).toBe(false);
  });

  it("treats empty optional numbers as valid", () => {
    const field = makeField({ id: "n", type: "number" });
    expect(buildZodSchema([field]).safeParse({ n: "" }).success).toBe(true);
  });

  it("requires checkboxes to be true only when required", () => {
    const required = makeField({ id: "tos", type: "checkbox", required: true });
    const optional = makeField({ id: "news", type: "checkbox" });
    const schema = buildZodSchema([required, optional]);
    expect(schema.safeParse({ tos: false, news: false }).success).toBe(false);
    expect(schema.safeParse({ tos: true, news: false }).success).toBe(true);
  });

  it("requires at least one multiselect choice when required", () => {
    const field = makeField({
      id: "tags",
      type: "multiselect",
      required: true,
    });
    const schema = buildZodSchema([field]);
    expect(schema.safeParse({ tags: [] }).success).toBe(false);
    expect(schema.safeParse({ tags: ["a"] }).success).toBe(true);
  });

  it("treats a 0 rating as unanswered", () => {
    const field = makeField({ id: "stars", type: "rating", required: true });
    const schema = buildZodSchema([field]);
    expect(schema.safeParse({ stars: 0 }).success).toBe(false);
    expect(schema.safeParse({ stars: 3 }).success).toBe(true);
    expect(schema.safeParse({ stars: 6 }).success).toBe(false);

    const optional = makeField({ id: "s2", type: "rating" });
    expect(buildZodSchema([optional]).safeParse({ s2: 0 }).success).toBe(true);
  });

  it("validates date min/max as ISO date strings", () => {
    const field = makeField({
      id: "day",
      type: "date",
      required: true,
      validations: [
        { type: "min", value: "2026-01-01", message: "too early" },
        { type: "max", value: "2026-12-31", message: "too late" },
      ],
    });
    const schema = buildZodSchema([field]);
    expect(schema.safeParse({ day: "" }).success).toBe(false);
    expect(schema.safeParse({ day: "2025-06-01" }).success).toBe(false);
    expect(schema.safeParse({ day: "2026-06-01" }).success).toBe(true);
    expect(schema.safeParse({ day: "2027-01-01" }).success).toBe(false);
  });

  it("validates required files and size limits", () => {
    const field = makeField({
      id: "cv",
      type: "file",
      required: true,
      maxSizeMB: 1,
    });
    const schema = buildZodSchema([field]);
    expect(schema.safeParse({ cv: [] }).success).toBe(false);

    const small = new File(["ok"], "cv.txt");
    expect(schema.safeParse({ cv: [small] }).success).toBe(true);

    const big = new File([new ArrayBuffer(2 * 1024 * 1024)], "big.bin");
    expect(schema.safeParse({ cv: [big] }).success).toBe(false);
  });

  it("skips section fields entirely", () => {
    const section = makeField({ id: "sec", type: "section" });
    const schema = buildZodSchema([section]);
    expect(schema.safeParse({}).success).toBe(true);
  });
});

describe("isFieldVisible", () => {
  const target = (
    operator:
      | "equals"
      | "not_equals"
      | "contains"
      | "is_empty"
      | "is_not_empty",
    value: string,
    action: "show" | "hide" = "show",
  ) =>
    makeField({
      id: "target",
      conditional: { fieldId: "source", operator, value, action },
    });

  it("is visible without a rule", () => {
    expect(isFieldVisible(makeField(), {})).toBe(true);
  });

  it("handles equals / not_equals", () => {
    expect(isFieldVisible(target("equals", "yes"), { source: "yes" })).toBe(true);
    expect(isFieldVisible(target("equals", "yes"), { source: "no" })).toBe(false);
    expect(isFieldVisible(target("not_equals", "yes"), { source: "no" })).toBe(true);
  });

  it("handles contains for strings and arrays", () => {
    expect(isFieldVisible(target("contains", "ell"), { source: "hello" })).toBe(true);
    expect(isFieldVisible(target("contains", "b"), { source: ["a", "b"] })).toBe(true);
    expect(isFieldVisible(target("contains", "z"), { source: ["a", "b"] })).toBe(false);
  });

  it("treats false, empty arrays, and blank strings as empty", () => {
    expect(isFieldVisible(target("is_empty", ""), { source: false })).toBe(true);
    expect(isFieldVisible(target("is_empty", ""), { source: [] })).toBe(true);
    expect(isFieldVisible(target("is_empty", ""), { source: "  " })).toBe(true);
    expect(isFieldVisible(target("is_empty", ""), { source: "x" })).toBe(false);
    expect(isFieldVisible(target("is_not_empty", ""), { source: "x" })).toBe(true);
  });

  it("checkbox true compares as the string 'true'", () => {
    expect(isFieldVisible(target("equals", "true"), { source: true })).toBe(true);
  });

  it("inverts the result for hide rules", () => {
    expect(
      isFieldVisible(target("equals", "yes", "hide"), { source: "yes" }),
    ).toBe(false);
    expect(
      isFieldVisible(target("equals", "yes", "hide"), { source: "no" }),
    ).toBe(true);
  });
});

describe("getDefaultValues / fieldIsRequired", () => {
  it("produces the right empty value per type", () => {
    const values = getDefaultValues([
      makeField({ id: "t", type: "text" }),
      makeField({ id: "m", type: "multiselect" }),
      makeField({ id: "c", type: "checkbox" }),
      makeField({ id: "r", type: "rating" }),
      makeField({ id: "f", type: "file" }),
      makeField({ id: "s", type: "section" }),
    ]);
    expect(values).toEqual({ t: "", m: [], c: false, r: 0, f: [] });
  });

  it("detects required via flag or rule", () => {
    expect(fieldIsRequired(makeField({ required: true }))).toBe(true);
    expect(
      fieldIsRequired(
        makeField({ validations: [{ type: "required", message: "x" }] }),
      ),
    ).toBe(true);
    expect(fieldIsRequired(makeField())).toBe(false);
  });
});
