<div align="center">

# 🔨 FormForge

**Build forms that don't suck.**

Drag. Drop. Validate. Export. No code required.

[**Live demo →**](https://formforge-three-lake.vercel.app) · [Report a bug](https://github.com/vinamra1102/FormForge/issues)

</div>

![FormForge — drag-and-drop form builder](public/illustrations/hero-drag-drop.png)

FormForge is a drag-and-drop form builder SaaS. Compose a form from 12 field
types, wire up real validation rules and conditional logic, preview it live,
and export it as a JSON schema, a production-ready React component, or an
embed snippet that renders anywhere.

## Features

- **12 field types** — text, long text, dropdown, multi-select pills, checkbox,
  radio group, date, number, star rating, drag-and-drop file upload, section
  break, and conditional fields.
- **Real validation** — every rule becomes a live [Zod](https://zod.dev)
  schema evaluated by [React Hook Form](https://react-hook-form.com):
  required, min/max length, min/max value, regex pattern, email, URL — all
  with custom error messages.
- **Conditional logic** — show or hide any field based on another field's
  live answer (`equals`, `not equals`, `contains`, `is empty`, `is not empty`).
  Hidden fields are never validated or submitted.
- **Export anywhere** — one click for:
  - **JSON Schema** — the clean, typed `FormSchema` object;
  - **React component** — a complete TSX component with RHF + Zod inlined;
  - **Embed code** — a `<script>` snippet powered by `public/embed.js` that
    renders the form on any website, validation and conditional logic included.
- **Undo everything** — 50-step history stack. `Ctrl+Z` / `Ctrl+Shift+Z`.
- **Accessible by default** — the entire builder is keyboard-operable
  (Enter to edit, Delete to remove, arrows to reorder), every input is
  labelled, and focus is always visible. Press `?` for the shortcuts panel.
- **Dark mode** — throughout the app, plus a per-form theme for previews.
- **Mobile responsive** — the builder degrades gracefully to a single column
  at 375px; preview forms are fully usable on phones.

## Tech stack

| Layer      | Choice                                                 |
| ---------- | ------------------------------------------------------ |
| Framework  | Next.js 15 (App Router) + React 19 + TypeScript strict |
| Styling    | Tailwind CSS v4 (CSS-first brand tokens), shadcn-style primitives on Radix UI |
| Drag & drop| @dnd-kit/core + @dnd-kit/sortable                      |
| Forms      | React Hook Form v7 + Zod v3 (dynamic schema builder)   |
| State      | Zustand v5 (undo/redo history + localStorage persist)  |
| Animation  | Framer Motion v11                                      |
| Testing    | Vitest + React Testing Library, Playwright E2E         |

## Getting started

```bash
# Requirements: Node 20+ and pnpm 9+
pnpm install
pnpm dev          # http://localhost:3000
```

### Scripts

| Command          | What it does                                  |
| ---------------- | --------------------------------------------- |
| `pnpm dev`       | Start the dev server                          |
| `pnpm build`     | Production build                              |
| `pnpm start`     | Serve the production build                    |
| `pnpm lint`      | ESLint                                        |
| `pnpm typecheck` | `tsc --noEmit` (strict mode, no `any`)        |
| `pnpm test`      | Unit + component tests (Vitest)               |
| `pnpm test:e2e`  | End-to-end tests (Playwright; run `pnpm build` first) |

## How it works

```
types/index.ts        The FormSchema model — single source of truth
lib/store.ts          Zustand store: fields, selection, 50-step undo history
lib/schema.ts         Zod schemas validating the FormSchema itself
lib/validators.ts     buildZodSchema(fields) → live preview validation
lib/export.ts         JSON / React component / embed code generators
components/builder/   Sidebar palette, DnD canvas, field editor, toolbar
components/fields/    The 12 field components (builder + preview modes)
components/preview/   Live preview: RHF + dynamic resolver + success screen
app/api/export/       POST endpoint (Zod-validated, 20 req/min per IP)
public/embed.js       Dependency-free runtime behind the embed export
```

The preview's clever bit: the Zod schema is rebuilt from the *currently
visible* fields on every validation pass, so a required field hidden by
conditional logic never blocks submission.

## API

```
POST /api/export
Content-Type: application/json

{ "schema": <FormSchema>, "format": "json" | "react" | "embed" }
→ { "output": "..." }
```

Rate limited to 20 requests/minute per IP.

## Screenshots

| Landing | Builder | Preview |
| ------- | ------- | ------- |
| ![Landing page](docs/screenshots/landing.png) | ![Form builder](docs/screenshots/builder.png) | ![Live preview](docs/screenshots/preview.png) |

## Credits

Built by **Vinamra Bhonsle**. Illustrations drawn in a flat, geometric,
Tintin-inspired style.
