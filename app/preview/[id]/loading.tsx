export default function PreviewLoading() {
  return (
    <div className="min-h-dvh bg-background" aria-label="Loading preview">
      <div className="h-14 border-b-2 border-line" />
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
        <div className="h-72 animate-pulse border-2 border-line-soft bg-surface" />
      </div>
    </div>
  );
}
