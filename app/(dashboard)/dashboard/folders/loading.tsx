import DashboardShell from "@/components/dashboard/dashboard-shell";
import { FolderCardSkeleton } from "@/components/ui/skeleton";

export default function FoldersLoading() {
  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header Section Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-primary/10 rounded animate-pulse" />
            <div className="h-5 w-64 bg-primary/10 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-primary/10 rounded animate-pulse" />
        </div>

        {/* Folder Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <FolderCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
