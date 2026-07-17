export default function DashboardLoading() {
  return (
    <div className="min-h-dvh bg-paper" aria-label="Loading dashboard">
      <div className="flex h-16 items-center justify-between border-b-2 border-ink px-4 sm:px-6">
        <div className="h-9 w-36 animate-pulse bg-mist" />
        <div className="h-9 w-28 animate-pulse bg-mist" />
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="h-8 w-40 animate-pulse bg-mist" />
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse border-2 border-ink/20 bg-mist"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
