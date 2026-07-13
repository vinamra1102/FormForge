import { beforeEach, describe, expect, it } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { createEmptyForm, useBuilderStore } from "@/lib/store";
import { Canvas } from "@/components/builder/Canvas";
import { TooltipProvider } from "@/components/ui/tooltip";

function resetStore() {
  const form = createEmptyForm("canvas-test");
  useBuilderStore.setState({
    form,
    selectedFieldId: null,
    history: [form],
    historyIndex: 0,
    isDirty: false,
  });
}

function renderCanvas() {
  return render(
    <TooltipProvider>
      <DndContext>
        <Canvas />
      </DndContext>
    </TooltipProvider>,
  );
}

const store = () => useBuilderStore.getState();

describe("Canvas", () => {
  beforeEach(resetStore);

  it("shows the empty state when there are no fields", () => {
    renderCanvas();
    expect(
      screen.getByText("Drag a field to get started"),
    ).toBeInTheDocument();
  });

  it("renders fields in store order", () => {
    store().addField("text");
    store().addField("number");
    store().addField("date");
    renderCanvas();

    const canvas = screen.getByRole("main", { name: "Form canvas" });
    const labels = within(canvas)
      .getAllByLabelText(/Press Enter to edit/)
      .map((node) => node.getAttribute("aria-label"));
    expect(labels).toHaveLength(3);
    expect(labels[0]).toContain("Text");
    expect(labels[1]).toContain("Number");
    expect(labels[2]).toContain("Date");
  });

  it("reorderFields swaps the rendered order", () => {
    const a = store().addField("text");
    store().addField("number");
    const c = store().addField("date");
    renderCanvas();

    act(() => store().reorderFields(a, c));

    const labels = screen
      .getAllByLabelText(/Press Enter to edit/)
      .map((node) => node.getAttribute("aria-label"));
    expect(labels[0]).toContain("Number");
    expect(labels[1]).toContain("Date");
    expect(labels[2]).toContain("Text");
  });

  it("selects a field on click and deletes it with the Delete key", async () => {
    const user = userEvent.setup();
    store().addField("text");
    store().selectField(null);
    renderCanvas();

    const card = screen.getByLabelText(/Text field:/);
    await user.click(card);
    expect(store().selectedFieldId).not.toBeNull();

    card.focus();
    await user.keyboard("{Delete}");
    expect(store().form.fields).toHaveLength(0);
  });

  it("reorders the focused card with arrow keys", async () => {
    const user = userEvent.setup();
    store().addField("text");
    store().addField("number");
    renderCanvas();

    const card = screen.getByLabelText(/Text field:/);
    card.focus();
    await user.keyboard("{ArrowDown}");

    expect(store().form.fields.map((f) => f.type)).toEqual([
      "number",
      "text",
    ]);
  });

  it("removes a field via its delete button", async () => {
    const user = userEvent.setup();
    store().addField("text");
    renderCanvas();

    await user.click(screen.getByLabelText(/^Delete /));
    expect(store().form.fields).toHaveLength(0);
  });
});
