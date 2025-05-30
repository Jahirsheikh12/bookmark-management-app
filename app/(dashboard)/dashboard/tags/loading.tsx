import DashboardShell from "@/components/dashboard/dashboard-shell";
import { TagCardSkeleton } from "@/components/ui/skeleton";

export default function TagsLoading() {
  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header Section Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-24 bg-primary/10 rounded animate-pulse" />
            <div className="h-5 w-64 bg-primary/10 rounded animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-primary/10 rounded animate-pulse" />
        </div>

        {/* Tag Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <TagCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
