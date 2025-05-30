import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  );
}

// Dashboard Card Skeleton
function DashboardCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

// Bookmark Card Skeleton
function BookmarkCardSkeleton() {
  return (
    <div className="h-full flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="p-4 pb-3 flex flex-row justify-between items-start space-y-0">
        <div className="flex-1 min-w-0">
          <Skeleton className="h-8 w-8 rounded mb-3" />
          <Skeleton className="h-5 w-3/4 mb-1" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8 rounded ml-2" />
      </div>

      <div className="p-4 pt-0 flex-grow">
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-2/3 mb-3" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      <div className="p-4 pt-0 flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-12 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-10 rounded" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}

// Bookmark Row Skeleton
function BookmarkRowSkeleton() {
  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card">
      <Skeleton className="h-8 w-8 rounded flex-shrink-0" />

      <div className="flex-grow min-w-0 space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <div className="hidden lg:flex items-center gap-1">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-16" />
        </div>

        <div className="hidden sm:flex gap-1">
          <Skeleton className="h-5 w-12 rounded" />
          <Skeleton className="h-5 w-14 rounded" />
        </div>

        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
}

// Folder Card Skeleton
function FolderCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

// Tag Card Skeleton
function TagCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

export {
  Skeleton,
  DashboardCardSkeleton,
  BookmarkCardSkeleton,
  BookmarkRowSkeleton,
  FolderCardSkeleton,
  TagCardSkeleton,
};
