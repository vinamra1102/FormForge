/**
 * Capture README screenshots against a running production server.
 * Usage: pnpm start (in another shell) → node scripts/screenshots.mjs
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "docs/screenshots";

const form = {
  id: "shot",
  title: "Event Registration",
  description: "Join us for ForgeConf 2026 — free, online, and worth it.",
  fields: [
    {
      id: "name",
      type: "text",
      label: "Full name",
      placeholder: "Ada Lovelace",
      required: true,
      validations: [],
      width: "full",
      order: 0,
    },
    {
      id: "email",
      type: "text",
      label: "Email",
      placeholder: "you@example.com",
      required: true,
      validations: [{ type: "email", message: "Enter a valid email" }],
      width: "half",
      order: 1,
    },
    {
      id: "size",
      type: "select",
      label: "T-shirt size",
      placeholder: "Pick a size…",
      required: false,
      validations: [],
      options: [
        { label: "Small", value: "s" },
        { label: "Medium", value: "m" },
        { label: "Large", value: "l" },
      ],
      width: "half",
      order: 2,
    },
    {
      id: "rating",
      type: "rating",
      label: "How excited are you?",
      required: false,
      validations: [],
      width: "full",
      order: 3,
    },
    {
      id: "tos",
      type: "checkbox",
      label: "I agree to the code of conduct",
      required: true,
      validations: [],
      width: "full",
      order: 4,
    },
  ],
  settings: {
    submitLabel: "Register",
    successMessage: "See you at ForgeConf!",
    theme: "light",
  },
  createdAt: "2026-07-13T00:00:00.000Z",
  updatedAt: "2026-07-13T00:00:00.000Z",
};

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Landing
await page.goto(BASE, { waitUntil: "networkidle" });
await page.screenshot({ path: `${OUT}/landing.png` });

// Builder (seeded with the sample form)
await page.addInitScript((data) => {
  window.localStorage.setItem(
    "formforge:builder",
    JSON.stringify({ state: { form: JSON.parse(data) }, version: 0 }),
  );
}, JSON.stringify(form));
await page.goto(`${BASE}/builder`, { waitUntil: "networkidle" });
await page.getByLabel(/Text field: Full name/).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/builder.png` });

// Preview
await page.addInitScript((data) => {
  window.localStorage.setItem("formforge:form:shot", data);
}, JSON.stringify(form));
await page.goto(`${BASE}/preview/shot`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/preview.png` });

await browser.close();
console.log(`Saved 3 screenshots to ${OUT}/`);
