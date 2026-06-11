import { CardSkeleton } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6 animate-pulse">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-surface border border-border p-4 space-y-3">
            <div className="h-3 w-24 bg-surface-tertiary rounded" />
            <div className="h-8 w-32 bg-surface-tertiary rounded" />
            <div className="h-3 w-20 bg-surface-tertiary rounded" />
          </div>
        ))}
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Table */}
      <div className="rounded-xl bg-surface border border-border p-4 space-y-3">
        <div className="h-5 w-40 bg-surface-tertiary rounded mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <div className="h-8 w-8 rounded-full bg-surface-tertiary" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 bg-surface-tertiary rounded" />
              <div className="h-3 w-1/2 bg-surface-tertiary rounded" />
            </div>
            <div className="h-4 w-20 bg-surface-tertiary rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
