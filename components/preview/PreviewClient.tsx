"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Hammer, Moon, Sun } from "lucide-react";
import type { FormSchema } from "@/types";
import { safeParseFormSchema } from "@/lib/schema";
import { readFormSnapshot } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PreviewForm } from "./PreviewForm";

type LoadState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "ready"; form: FormSchema };

/** Decode a base64url-encoded schema from the `?s=` search param. */
function decodeSharedSchema(encoded: string | null): FormSchema | null {
  if (!encoded) return null;
  try {
    const json = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = safeParseFormSchema(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Read the builder's own persisted draft as a fallback source. */
function readBuilderDraft(id: string): FormSchema | null {
  try {
    const raw = window.localStorage.getItem("formforge:builder");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { form?: unknown } };
    const result = safeParseFormSchema(parsed.state?.form);
    return result.success && result.data.id === id ? result.data : null;
  } catch {
    return null;
  }
}

function MissingForm() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 border-2 border-line bg-surface px-6 py-12 text-center">
      <Image
        src="/illustrations/empty-canvas.png"
        alt="A robot pointing at an empty canvas"
        width={220}
        height={220}
        className="h-auto w-44"
      />
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Form not found
        </h1>
        <p className="text-sm text-foreground/60">
          Previews are stored in your browser. Head back to the builder, hit
          Save, and try again.
        </p>
      </div>
      <Button asChild variant="brand">
        <Link href="/builder">
          <ArrowLeft />
          Open the builder
        </Link>
      </Button>
    </div>
  );
}

/** Loads the schema (URL param → saved snapshot → builder draft) and renders it. */
export function PreviewClient({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const shared = decodeSharedSchema(searchParams.get("s"));
    const form = shared ?? readFormSnapshot(id) ?? readBuilderDraft(id);
    if (form) {
      setState({ status: "ready", form });
      setDark(form.settings.theme === "dark");
    } else {
      setState({ status: "missing" });
    }
  }, [id, searchParams]);

  return (
    <div className={cn(dark && "dark")}>
      <div className="min-h-dvh bg-background text-foreground transition-colors">
        <header className="flex h-14 items-center justify-between border-b-2 border-line bg-background px-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 focus-hard"
            aria-label="FormForge home"
          >
            <span className="flex size-8 items-center justify-center border-2 border-ink bg-brand text-ink dark:border-line">
              <Hammer className="size-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Form<span className="text-crimson">Forge</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="border-2 border-line bg-brand px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wide text-ink">
              Preview
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle preview theme"
              onClick={() => setDark((d) => !d)}
            >
              {dark ? <Sun /> : <Moon />}
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/builder">
                <ArrowLeft />
                Back to builder
              </Link>
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
          {state.status === "loading" && (
            <div
              className="h-64 animate-pulse border-2 border-line-soft bg-surface"
              aria-label="Loading preview"
            />
          )}
          {state.status === "missing" && <MissingForm />}
          {state.status === "ready" && <PreviewForm form={state.form} />}
        </main>
      </div>
    </div>
  );
}
