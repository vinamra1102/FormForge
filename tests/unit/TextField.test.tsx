import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FormSchema } from "@/types";
import { createEmptyForm, createField } from "@/lib/store";
import { TextField } from "@/components/fields/TextField";
import { PreviewForm } from "@/components/preview/PreviewForm";

function formWith(fields: FormSchema["fields"]): FormSchema {
  const form = createEmptyForm("test");
  form.title = "Test form";
  form.fields = fields;
  return form;
}

describe("TextField (builder mode)", () => {
  it("renders label, required marker, placeholder, and help text", () => {
    const field = createField("text", 0);
    field.label = "Full name";
    field.placeholder = "Ada Lovelace";
    field.helpText = "As it appears on your ID";
    field.required = true;

    render(<TextField field={field} />);

    expect(screen.getByText("Full name")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("As it appears on your ID")).toBeInTheDocument();
  });
});

describe("TextField (preview mode)", () => {
  it("shows a required error on empty submit, then clears after typing", async () => {
    const user = userEvent.setup();
    const field = createField("text", 0);
    field.label = "Full name";
    field.required = true;

    render(<PreviewForm form={formWith([field])} />);

    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Full name is required",
    );

    await user.type(screen.getByLabelText(/Full name/), "Ada");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByRole("status")).toBeInTheDocument();
  });

  it("enforces minLength with the custom message", async () => {
    const user = userEvent.setup();
    const field = createField("text", 0);
    field.label = "Code";
    field.required = true;
    field.validations = [
      { type: "minLength", value: 4, message: "At least 4 characters" },
    ];

    render(<PreviewForm form={formWith([field])} />);

    await user.type(screen.getByLabelText(/Code/), "abc");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "At least 4 characters",
    );
  });

  it("shows the success screen with the configured message on valid submit", async () => {
    const user = userEvent.setup();
    const field = createField("text", 0);
    field.label = "Nickname";
    const form = formWith([field]);
    form.settings.successMessage = "You're in!";

    render(<PreviewForm form={form} />);
    await user.type(screen.getByLabelText(/Nickname/), "Vin");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("You're in!")).toBeInTheDocument();
  });
});
