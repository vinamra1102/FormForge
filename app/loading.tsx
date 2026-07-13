export default function Loading() {
  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-background"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-4 animate-bounce border-2 border-line bg-brand [animation-delay:0ms]" />
          <span className="size-4 animate-bounce border-2 border-line bg-crimson [animation-delay:120ms]" />
          <span className="size-4 animate-bounce border-2 border-line bg-ink [animation-delay:240ms] dark:bg-paper" />
        </div>
        <p className="font-display text-sm font-bold text-foreground/60">
          Forging…
        </p>
      </div>
    </main>
  );
}
