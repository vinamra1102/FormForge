"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Hammer, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { clerkEnabled } from "@/lib/clerk-appearance";
import { storageAdapter, type SavedForm } from "@/lib/storage";
import { useBuilderStore } from "@/lib/store";
import { relativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; forms: SavedForm[] };

function SkeletonCard() {
  return (
    <div className="h-40 animate-pulse border-2 border-line-soft bg-mist" />
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 border-2 border-ink bg-paper px-6 py-14 text-center">
      <Image
        src="/illustrations/empty-canvas.png"
        alt="A friendly robot pointing at an empty grid"
        width={280}
        height={280}
        className="h-auto w-56 sm:w-70"
      />
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-bold text-ink">
          No forms yet
        </h2>
        <p className="text-sm text-ink/60">
          Create your first form and it&apos;ll appear here.
        </p>
      </div>
      <Button asChild>
        <Link href="/builder">Create a form →</Link>
      </Button>
    </div>
  );
}

function FormCard({
  form,
  onDelete,
}: {
  form: SavedForm;
  onDelete: (id: string) => void;
}) {
  return (
    <article className="flex flex-col border-2 border-ink bg-paper p-5 transition-colors duration-200 hover:bg-brand">
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-ink">
          {form.title}
        </h2>
        <span className="shrink-0 border-2 border-ink bg-brand px-1.5 py-0.5 font-mono text-xs font-semibold text-ink">
          v{form.version}
        </span>
      </div>
      {form.description && (
        <p className="mt-1 line-clamp-2 text-sm text-ink/60">
          {form.description}
        </p>
      )}
      <p className="mt-2 text-xs text-ink/40">
        Saved {relativeTime(form.savedAt)} ·{" "}
        {form.schema.fields.length}{" "}
        {form.schema.fields.length === 1 ? "field" : "fields"}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2 border-t-2 border-ink/10 pt-3">
        <Button asChild variant="outline" size="sm" className="border-crimson text-crimson hover:bg-crimson hover:text-white">
          <Link href={`/builder?form=${encodeURIComponent(form.id)}`}>
            <Pencil />
            Edit
          </Link>
        </Button>
        <button
          type="button"
          aria-label={`Delete ${form.title}`}
          onClick={() => onDelete(form.id)}
          className="flex size-11 items-center justify-center rounded-sm text-crimson transition-colors focus-hard hover:bg-crimson hover:text-white"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </article>
  );
}

/** Dashboard: every saved form, newest first. */
export function DashboardClient() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const forms = await storageAdapter.getForms();
      setState({ status: "ready", forms });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (id: string) => {
    const form =
      state.status === "ready"
        ? state.forms.find((f) => f.id === id)
        : undefined;
    if (
      !window.confirm(
        `Delete “${form?.title ?? "this form"}”? This can't be undone.`,
      )
    ) {
      return;
    }
    try {
      await storageAdapter.deleteForm(id);
      toast.success("Form deleted");
      void load();
    } catch {
      toast.error("Couldn't delete the form");
    }
  };

  const handleNewForm = () => {
    useBuilderStore.getState().resetForm();
    router.push("/builder");
  };

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="flex h-16 items-center justify-between border-b-2 border-ink bg-paper px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 focus-hard"
          aria-label="FormForge home"
        >
          <span className="flex size-9 items-center justify-center border-2 border-ink bg-brand">
            <Hammer className="size-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight max-sm:hidden">
            Form<span className="text-crimson">Forge</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {clerkEnabled && (
            <UserButton
              appearance={{
                elements: { avatarBox: "size-9 border-2 border-ink rounded-none" },
              }}
            />
          )}
          <Button onClick={handleNewForm}>
            <Plus />
            New Form
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-2xl font-bold">Your forms</h1>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.status === "loading" && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {state.status === "error" && (
            <div className="col-span-full flex items-center justify-between gap-4 border-2 border-crimson bg-paper px-4 py-3">
              <p className="text-sm font-semibold text-crimson">
                Failed to load forms.
              </p>
              <Button variant="outline" size="sm" onClick={() => void load()}>
                <RotateCcw />
                Retry
              </Button>
            </div>
          )}

          {state.status === "ready" &&
            (state.forms.length === 0 ? (
              <EmptyState />
            ) : (
              state.forms.map((form) => (
                <FormCard key={form.id} form={form} onDelete={handleDelete} />
              ))
            ))}
        </div>
      </main>
    </div>
  );
}
