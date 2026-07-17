"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PreviewError({
  error,
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
          src="/illustrations/empty-canvas.png"
          alt="A robot pointing at an empty grid"
          width={200}
          height={200}
          className="h-auto w-40"
        />
        <h1 className="font-display text-2xl font-bold text-ink">
          This form couldn&apos;t be loaded.
        </h1>
        <p className="text-sm text-ink/60">
          The link may be invalid or the form was deleted.
        </p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft />
            Go to FormForge
          </Link>
        </Button>
      </div>
    </main>
  );
}
