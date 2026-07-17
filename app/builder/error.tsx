"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BuilderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper p-4">
      <div className="flex w-full max-w-[480px] flex-col items-center gap-5 border-2 border-ink bg-paper px-6 py-10 text-center">
        <span className="font-display text-xl font-bold tracking-tight text-ink">
          Form<span className="text-crimson">Forge</span>
        </span>
        <Image
          src="/illustrations/hero-drag-drop.png"
          alt="The FormForge builder illustration"
          width={200}
          height={113}
          className="h-auto w-50 border-2 border-ink"
        />
        <h1 className="font-display text-2xl font-bold text-ink">
          Something went wrong in the builder.
        </h1>
        <pre className="w-full overflow-auto border-2 border-ink bg-mist p-3 text-left font-mono text-xs leading-relaxed text-ink">
          {error.message || "Unknown error"}
        </pre>
        <p className="text-sm text-ink/60">
          Your draft is safe — it lives in your browser and autosaves every 30
          seconds.
        </p>
        <div className="flex gap-2">
          <Button onClick={reset}>
            <RotateCcw />
            Reload builder
          </Button>
          <Button asChild variant="outline" className="border-ink text-ink">
            <Link href="/">
              <ArrowLeft />
              Go home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
