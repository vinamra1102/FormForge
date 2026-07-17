import Link from "next/link";
import { Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Centered Paper-background layout with the wordmark above the auth card. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-paper p-4">
      <Link
        href="/"
        className="flex items-center gap-1.5 focus-hard"
        aria-label="FormForge home"
      >
        <span className="flex size-10 items-center justify-center border-2 border-ink bg-brand text-ink">
          <Hammer className="size-5" />
        </span>
        <span className="font-display text-2xl font-bold tracking-tight text-ink">
          Form<span className="text-crimson">Forge</span>
        </span>
      </Link>
      {children}
    </main>
  );
}

/** Shown when Clerk env keys are missing — the app still works locally. */
export function AuthNotConfigured() {
  return (
    <div className="max-w-sm border-2 border-ink bg-white p-6 text-center text-ink">
      <h1 className="font-display text-xl font-bold">
        Auth isn&apos;t configured
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Set the Clerk keys from{" "}
        <code className="font-mono text-xs">.env.local.example</code> to enable
        accounts. Until then, forms are saved in your browser.
      </p>
      <Button asChild className="mt-4">
        <Link href="/builder">Keep building locally</Link>
      </Button>
    </div>
  );
}
