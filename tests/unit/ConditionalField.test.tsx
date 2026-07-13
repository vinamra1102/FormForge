import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FormSchema } from "@/types";
import { createEmptyForm, createField } from "@/lib/store";
import { PreviewForm } from "@/components/preview/PreviewForm";

function conditionalForm(
  operator: "equals" | "is_not_empty",
  action: "show" | "hide",
): FormSchema {
  const form = createEmptyForm("cond");
  form.title = "Conditional test";

  const source = createField("text", 0);
  source.id = "source";
  source.label = "Trigger";

  const target = createField("text", 1);
  target.id = "target";
  target.label = "Secret field";
  target.conditional = {
    fieldId: "source",
    operator,
    value: operator === "equals" ? "open sesame" : "",
    action,
  };

  form.fields = [source, target];
  return form;
}

describe("conditional visibility in preview", () => {
  it("hides a show-when field until the rule matches, then shows it", async () => {
    const user = userEvent.setup();
    render(<PreviewForm form={conditionalForm("equals", "show")} />);

    expect(screen.queryByLabelText(/Secret field/)).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/Trigger/), "open sesame");
    expect(await screen.findByLabelText(/Secret field/)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Trigger/), "!");
    expect(screen.queryByLabelText(/Secret field/)).not.toBeInTheDocument();
  });

  it("hide-when rules invert the behaviour", async () => {
    const user = userEvent.setup();
    render(<PreviewForm form={conditionalForm("is_not_empty", "hide")} />);

    // Source empty → not "not empty" → hide doesn't fire → visible.
    expect(screen.getByLabelText(/Secret field/)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Trigger/), "x");
    expect(screen.queryByLabelText(/Secret field/)).not.toBeInTheDocument();
  });

  it("does not validate hidden required fields", async () => {
    const user = userEvent.setup();
    const form = conditionalForm("equals", "show");
    form.fields[1]!.required = true;

    render(<PreviewForm form={form} />);

    // Secret field is hidden and required — submit must still succeed.
    await user.type(screen.getByLabelText(/Trigger/), "something else");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByRole("status")).toBeInTheDocument();
  });

  it("validates the field once it becomes visible", async () => {
    const user = userEvent.setup();
    const form = conditionalForm("equals", "show");
    form.fields[1]!.required = true;

    render(<PreviewForm form={form} />);

    await user.type(screen.getByLabelText(/Trigger/), "open sesame");
    await screen.findByLabelText(/Secret field/);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Secret field is required",
    );
  });
});
