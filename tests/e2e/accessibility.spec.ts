import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto("/builder");
});

test.describe("keyboard accessibility", () => {
  test("palette items are reachable and operable with the keyboard", async ({
    page,
  }) => {
    const paletteButton = page.getByLabel(/Add Text field/);
    await paletteButton.focus();
    await expect(paletteButton).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page.getByLabel(/Text field: Text field/)).toBeVisible();
  });

  test("canvas cards: Enter selects, arrows reorder, Delete removes", async ({
    page,
  }) => {
    await page.getByLabel(/Add Text field/).click();
    await page.getByLabel(/Add Number field/).click();
    // Close the editor so selection state is clean.
    await page.getByLabel("Close field editor").click();

    const textCard = page.getByLabel(/Text field: Text field/);
    await textCard.focus();

    // Enter opens the editor.
    await page.keyboard.press("Enter");
    await expect(page.getByLabel(/^Edit /)).toBeVisible();

    // ArrowDown moves the text field below the number field.
    await textCard.focus();
    await page.keyboard.press("ArrowDown");
    const labels = await page
      .getByLabel(/Press Enter to edit/)
      .evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute("aria-label") ?? ""),
      );
    expect(labels[0]).toContain("Number");
    expect(labels[1]).toContain("Text");

    // Delete removes the focused card.
    await textCard.focus();
    await page.keyboard.press("Delete");
    await expect(page.getByLabel(/Press Enter to edit/)).toHaveCount(1);
  });

  test("Ctrl+Z undoes and Ctrl+Shift+Z redoes", async ({ page }) => {
    await page.getByLabel(/Add Text field/).click();
    await expect(page.getByLabel(/Press Enter to edit/)).toHaveCount(1);

    // Blur the auto-focused editor input so the shortcut isn't swallowed.
    await page.getByLabel("Form canvas").click();

    await page.keyboard.press("Control+z");
    await expect(page.getByLabel(/Press Enter to edit/)).toHaveCount(0);

    await page.keyboard.press("Control+Shift+z");
    await expect(page.getByLabel(/Press Enter to edit/)).toHaveCount(1);
  });

  test("editor tabs are keyboard navigable", async ({ page }) => {
    await page.getByLabel(/Add Text field/).click();
    const editor = page.getByLabel(/^Edit /);

    const contentTab = editor.getByRole("tab", { name: "Content" });
    await contentTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(editor.getByRole("tab", { name: "Rules" })).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(editor.getByLabel("Required field")).toBeVisible();
  });

  test("every form control in the preview has an accessible name", async ({
    page,
  }) => {
    await page.getByLabel(/Add Text field/).click();
    await page.getByLabel(/Add Rating field/).click();

    const [preview] = await Promise.all([
      page.context().waitForEvent("page"),
      page.getByRole("button", { name: "Preview" }).click(),
    ]);
    await preview.waitForLoadState();

    await expect(preview.getByLabel(/Text field/)).toBeVisible();
    await expect(
      preview.getByRole("radiogroup", { name: /Rate your experience/ }),
    ).toBeVisible();
    await expect(
      preview.getByRole("radio", { name: "3 stars" }),
    ).toBeVisible();
  });
});
