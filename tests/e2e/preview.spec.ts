import { expect, test } from "@playwright/test";

const FORM = {
  id: "e2e-form",
  title: "E2E Test Form",
  description: "Filled in by robots.",
  fields: [
    {
      id: "name",
      type: "text",
      label: "Your name",
      placeholder: "Ada",
      required: true,
      validations: [],
      width: "full",
      order: 0,
    },
    {
      id: "email",
      type: "text",
      label: "Email",
      required: false,
      validations: [{ type: "email", message: "That email looks wrong" }],
      width: "full",
      order: 1,
    },
    {
      id: "trigger",
      type: "text",
      label: "Trigger",
      required: false,
      validations: [],
      width: "full",
      order: 2,
    },
    {
      id: "secret",
      type: "text",
      label: "Secret field",
      required: false,
      validations: [],
      width: "full",
      order: 3,
      conditional: {
        fieldId: "trigger",
        operator: "equals",
        value: "open",
        action: "show",
      },
    },
  ],
  settings: {
    submitLabel: "Send it",
    successMessage: "Recorded!",
    theme: "light",
  },
  createdAt: "2026-07-13T00:00:00.000Z",
  updatedAt: "2026-07-13T00:00:00.000Z",
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((data) => {
    window.localStorage.setItem("formforge:form:e2e-form", data);
  }, JSON.stringify(FORM));
  await page.goto("/preview/e2e-form");
});

test.describe("preview", () => {
  test("renders the saved form", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "E2E Test Form" }),
    ).toBeVisible();
    await expect(page.getByText("Filled in by robots.")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Send it" }),
    ).toBeVisible();
  });

  test("shows validation errors and recovers", async ({ page }) => {
    await page.getByRole("button", { name: "Send it" }).click();
    await expect(page.getByText("Your name is required")).toBeVisible();

    await page.getByLabel(/Email/).fill("not-an-email");
    await page.getByRole("button", { name: "Send it" }).click();
    await expect(page.getByText("That email looks wrong")).toBeVisible();

    await page.getByLabel(/Your name/).fill("Ada");
    await page.getByLabel(/Email/).fill("ada@lovelace.dev");
    await page.getByRole("button", { name: "Send it" }).click();

    await expect(page.getByRole("status")).toContainText("Recorded!");
    await expect(page.getByText("View submission data")).toBeVisible();
  });

  test("conditional field shows and hides live", async ({ page }) => {
    await expect(page.getByLabel(/Secret field/)).toHaveCount(0);

    await page.getByLabel(/Trigger/).fill("open");
    await expect(page.getByLabel(/Secret field/)).toBeVisible();

    await page.getByLabel(/Trigger/).fill("closed");
    await expect(page.getByLabel(/Secret field/)).toHaveCount(0);
  });

  test("submit-another resets the form", async ({ page }) => {
    await page.getByLabel(/Your name/).fill("Ada");
    await page.getByRole("button", { name: "Send it" }).click();
    await expect(page.getByRole("status")).toBeVisible();

    await page
      .getByRole("button", { name: "Submit another response" })
      .click();
    await expect(page.getByLabel(/Your name/)).toHaveValue("");
  });

  test("shows a friendly missing state for unknown ids", async ({ page }) => {
    await page.goto("/preview/does-not-exist");
    await expect(
      page.getByRole("heading", { name: "Form not found" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Open the builder/ }),
    ).toBeVisible();
  });

  test("is usable at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(
      page.getByRole("heading", { name: "E2E Test Form" }),
    ).toBeVisible();
    await page.getByLabel(/Your name/).fill("Ada");
    await page.getByRole("button", { name: "Send it" }).click();
    await expect(page.getByRole("status")).toBeVisible();
  });
});
