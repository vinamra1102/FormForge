import Image from "next/image";
import {
  Accessibility,
  GitBranch,
  LayoutGrid,
  Share2,
  ShieldCheck,
  Undo2,
} from "lucide-react";

const FEATURES = [
  {
    icon: LayoutGrid,
    title: "12 field types",
    description:
      "Text, dropdowns, ratings, file uploads, section breaks and more — every input a real form needs.",
  },
  {
    icon: ShieldCheck,
    title: "Real validation",
    description:
      "React Hook Form + Zod under the hood. Rules run live in the preview — zero runtime surprises.",
  },
  {
    icon: GitBranch,
    title: "Conditional logic",
    description:
      "Show or hide any field based on another answer. Equals, contains, empty — your call.",
  },
  {
    icon: Share2,
    title: "Export anywhere",
    description:
      "One click gets you a JSON schema, a ready-to-ship React component, or an embed snippet.",
  },
  {
    icon: Undo2,
    title: "Undo everything",
    description:
      "A 50-step history stack. Ctrl+Z out of any mistake, Ctrl+Shift+Z right back into it.",
  },
  {
    icon: Accessibility,
    title: "Accessible by default",
    description:
      "Keyboard-operable builder, labelled inputs, visible focus — WCAG 2.1 AA is the baseline.",
  },
];

/** 3-column editorial feature grid + two illustrated showcase rows. */
export function Features() {
  return (
    <section className="border-b-2 border-ink bg-white text-ink dark:bg-background dark:text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Everything a form needs.
          <span className="text-crimson"> Nothing it doesn&apos;t.</span>
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="group border-2 border-ink bg-white p-5 transition-colors hover:bg-brand dark:border-line dark:bg-surface dark:hover:bg-brand dark:hover:text-ink"
            >
              <span className="mb-4 flex size-10 items-center justify-center border-2 border-ink bg-brand text-ink transition-colors group-hover:bg-white dark:border-line">
                <feature.icon className="size-5" />
              </span>
              <h3 className="font-display text-lg font-bold">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed opacity-70">
                {feature.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-16 space-y-10">
          <div className="grid items-center gap-8 border-2 border-ink bg-mist p-6 dark:border-line dark:bg-surface lg:grid-cols-2 lg:p-10">
            <div>
              <span className="border-2 border-ink bg-brand px-2 py-0.5 font-display text-xs font-bold uppercase tracking-widest text-ink dark:border-line">
                Validation
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
                From red errors to green checks.
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed opacity-70">
                Every rule you add in the builder becomes a real Zod schema.
                Required fields, length limits, email and URL formats, custom
                regex — validated live as people type, with your own error
                messages.
              </p>
            </div>
            <Image
              src="/illustrations/validation-shield.png"
              alt="Before and after: form errors turning into green validation checks"
              width={1254}
              height={1254}
              className="h-auto w-full max-w-md justify-self-center border-2 border-ink bg-paper dark:border-line"
            />
          </div>

          <div className="grid items-center gap-8 border-2 border-ink bg-mist p-6 dark:border-line dark:bg-surface lg:grid-cols-2 lg:p-10">
            <Image
              src="/illustrations/export-code.png"
              alt="A JSON schema exporting into a React component"
              width={1536}
              height={1024}
              className="order-last h-auto w-full max-w-md justify-self-center border-2 border-ink bg-paper dark:border-line lg:order-first"
            />
            <div>
              <span className="border-2 border-ink bg-brand px-2 py-0.5 font-display text-xs font-bold uppercase tracking-widest text-ink dark:border-line">
                Export
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
                Your form, your codebase.
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed opacity-70">
                FormForge isn&apos;t a walled garden. Export a clean JSON
                schema, a typed React component wired up with React Hook Form
                and Zod, or a script tag that renders the form on any website.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
