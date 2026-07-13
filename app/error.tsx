"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
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
    <main className="flex min-h-dvh items-center justify-center bg-brand p-4">
      <div className="flex max-w-md flex-col items-center gap-5 border-2 border-ink bg-paper px-6 py-12 text-center">
        <Image
          src="/illustrations/empty-canvas.png"
          alt="A friendly robot pointing at an empty grid"
          width={200}
          height={200}
          className="h-auto w-40"
        />
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl font-bold text-crimson">
            Something broke.
          </h1>
          <p className="text-sm text-ink/60">
            An unexpected error occurred. Your form draft is safe in your
            browser — try again.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={reset}>
            <RotateCcw />
            Try again
          </Button>
          <Button asChild variant="outline" className="border-ink text-ink">
            <Link href="/">
              <ArrowLeft />
              Home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
