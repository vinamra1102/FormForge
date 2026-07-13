export default function BuilderLoading() {
  return (
    <div className="flex h-dvh flex-col bg-background" aria-label="Loading builder">
      <div className="h-14 shrink-0 border-b-2 border-line bg-background" />
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-72 shrink-0 space-y-3 border-r-2 border-line p-3 md:block">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse border-2 border-line-soft bg-surface-muted"
            />
          ))}
        </div>
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-3xl space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse border-2 border-line-soft bg-surface"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
