import Link from "next/link";
import { Github, Hammer } from "lucide-react";

/** Ink-black editorial footer. */
export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-center">
        <div>
          <span className="flex items-center gap-1.5">
            <span className="flex size-9 items-center justify-center border-2 border-paper bg-brand text-ink">
              <Hammer className="size-5" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">
              Form<span className="text-brand">Forge</span>
            </span>
          </span>
          <p className="mt-3 max-w-xs text-sm text-paper/60">
            Drag. Drop. Validate. Export. The form builder that stays out of
            your way.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm md:items-end">
          <a
            href="https://github.com/vinamra1102/FormForge"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-paper/80 transition-colors focus-hard hover:text-brand"
          >
            <Github className="size-4" />
            github.com/vinamra1102/FormForge
          </a>
          <Link
            href="/builder"
            className="text-paper/80 transition-colors focus-hard hover:text-brand"
          >
            Open the builder
          </Link>
          <p className="mt-2 text-paper/50">
            Built by <span className="font-semibold text-paper">Vinamra Bhonsle</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
