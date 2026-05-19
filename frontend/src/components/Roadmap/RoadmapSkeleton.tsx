export function RoadmapSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 w-2/3 rounded-xl bg-surface-container"></div>
        <div className="h-4 w-full rounded-xl bg-surface-container"></div>
        <div className="h-4 w-5/6 rounded-xl bg-surface-container"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-outline-variant/10 p-5 space-y-3">
          <div className="h-5 w-1/2 rounded-lg bg-surface-container"></div>
          <div className="h-4 w-full rounded-lg bg-surface-container"></div>
          <div className="h-4 w-4/5 rounded-lg bg-surface-container"></div>
          <div className="h-4 w-3/4 rounded-lg bg-surface-container"></div>
        </div>
        <div className="rounded-3xl border border-outline-variant/10 p-5 space-y-3">
          <div className="h-5 w-1/2 rounded-lg bg-surface-container"></div>
          <div className="h-4 w-full rounded-lg bg-surface-container"></div>
          <div className="h-4 w-4/5 rounded-lg bg-surface-container"></div>
          <div className="h-4 w-3/4 rounded-lg bg-surface-container"></div>
        </div>
      </div>

      <div className="rounded-3xl border border-outline-variant/10 p-5 space-y-3">
        <div className="h-5 w-40 rounded-lg bg-surface-container"></div>
        <div className="h-14 w-full rounded-2xl bg-surface-container"></div>
        <div className="h-14 w-full rounded-2xl bg-surface-container"></div>
        <div className="h-14 w-full rounded-2xl bg-surface-container"></div>
      </div>
    </div>
  );
}
