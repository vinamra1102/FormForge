import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto("/builder");
});

test.describe("builder", () => {
  test("adds a field via click and edits its label", async ({ page }) => {
    await page.getByLabel(/Add Text field/).click();

    const card = page.getByLabel(/Text field: Text field/);
    await expect(card).toBeVisible();

    // The new field is auto-selected — the editor panel opens.
    const editor = page.getByLabel(/^Edit /);
    await expect(editor).toBeVisible();

    await editor.getByLabel("Label", { exact: true }).fill("Full name");
    await expect(page.getByLabel(/Text field: Full name/)).toBeVisible();
  });

  test("drags a palette field onto the canvas", async ({ page }) => {
    const source = page.getByLabel(/Add Long text field/);
    const canvas = page.getByLabel("Form canvas");

    const sourceBox = (await source.boundingBox())!;
    const canvasBox = (await canvas.boundingBox())!;

    await page.mouse.move(
      sourceBox.x + sourceBox.width / 2,
      sourceBox.y + sourceBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      canvasBox.x + canvasBox.width / 2,
      canvasBox.y + 160,
      { steps: 12 },
    );
    await page.mouse.up();

    await expect(page.getByLabel(/Long text field:/)).toBeVisible();
  });

  test("undo and redo from the toolbar", async ({ page }) => {
    await page.getByLabel(/Add Text field/).click();
    await page.getByLabel(/Add Number field/).click();
    await expect(page.getByLabel(/Press Enter to edit/)).toHaveCount(2);

    await page.getByLabel("Undo", { exact: true }).click();
    await expect(page.getByLabel(/Press Enter to edit/)).toHaveCount(1);

    await page.getByLabel("Redo", { exact: true }).click();
    await expect(page.getByLabel(/Press Enter to edit/)).toHaveCount(2);
  });

  test("exports the form as JSON", async ({ page }) => {
    await page.getByLabel(/Add Text field/).click();

    await page.getByRole("button", { name: "Export" }).click();
    await page.getByRole("menuitem", { name: "JSON Schema" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("pre")).toContainText('"type": "text"');
    await expect(dialog.locator("pre")).toContainText('"fields"');

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("full flow: add → configure → preview → submit", async ({
    page,
    context,
  }) => {
    await page.getByLabel(/Add Text field/).click();

    const editor = page.getByLabel(/^Edit /);
    await editor.getByLabel("Label", { exact: true }).fill("Your name");
    await expect(page.getByLabel(/Text field: Your name/)).toBeVisible();

    // Make it required from the Rules tab.
    await editor.getByRole("tab", { name: "Rules" }).click();
    await editor.getByLabel("Required field").click();

    // Open the live preview (new tab).
    const [preview] = await Promise.all([
      context.waitForEvent("page"),
      page.getByRole("button", { name: "Preview" }).click(),
    ]);
    await preview.waitForLoadState();

    await expect(
      preview.getByRole("heading", { name: "Untitled form" }),
    ).toBeVisible();

    // Empty submit → validation error.
    await preview.getByRole("button", { name: "Submit" }).click();
    await expect(preview.getByText("Your name is required")).toBeVisible();

    // Fill and submit → success screen.
    await preview.getByLabel(/Your name/).fill("Ada Lovelace");
    await preview.getByRole("button", { name: "Submit" }).click();
    await expect(preview.getByRole("status")).toContainText(
      "Thanks! Your response has been recorded.",
    );
  });

  test("width toggle switches a field to half width", async ({ page }) => {
    await page.getByLabel(/Add Text field/).click();
    await page.getByLabel("Shrink to half width").click();
    await expect(page.getByLabel("Expand to full width")).toBeVisible();
  });
});
