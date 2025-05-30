import DashboardShell from "@/components/dashboard/dashboard-shell";
import { BookmarkCardSkeleton } from "@/components/ui/skeleton";

export default function BookmarksLoading() {
  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        {/* Header Section Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-primary/10 rounded animate-pulse" />
            <div className="h-5 w-80 bg-primary/10 rounded animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-primary/10 rounded animate-pulse" />
        </div>

        {/* View Toggle Skeleton */}
        <div className="flex justify-end">
          <div className="h-9 w-32 bg-primary/10 rounded animate-pulse" />
        </div>

        {/* Bookmark Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <BookmarkCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
