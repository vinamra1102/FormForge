import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-brand p-4">
      <div className="flex max-w-md flex-col items-center gap-5 border-2 border-ink bg-paper px-6 py-12 text-center">
        <Image
          src="/illustrations/empty-canvas.png"
          alt="A friendly robot pointing at an empty grid"
          width={220}
          height={220}
          className="h-auto w-44"
        />
        <div className="space-y-1.5">
          <h1 className="font-display text-4xl font-bold text-crimson">404</h1>
          <p className="font-display text-xl font-bold text-ink">
            This page doesn&apos;t exist.
          </p>
          <p className="text-sm text-ink/60">
            Even our robot can&apos;t find it — and he&apos;s very thorough.
          </p>
        </div>
        <Button asChild variant="primary">
          <Link href="/">
            <ArrowLeft />
            Back to FormForge
          </Link>
        </Button>
      </div>
    </main>
  );
}
