import DashboardShell from "@/components/dashboard/dashboard-shell";
import {
  DashboardCardSkeleton,
  BookmarkCardSkeleton,
} from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <div className="flex flex-col space-y-8">
        {/* Header Section Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-48 bg-primary/10 rounded animate-pulse" />
          <div className="h-5 w-80 bg-primary/10 rounded animate-pulse" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
        </div>

        {/* Recent Bookmarks Section Skeleton */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-7 w-56 bg-primary/10 rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-9 w-32 bg-primary/10 rounded animate-pulse" />
            </div>
          </div>

          {/* Bookmark Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <BookmarkCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
