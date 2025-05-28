import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { BookmarkWithRelations } from "@/types/bookmark";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import BookmarkList from "@/components/dashboard/bookmark-list";
import EmptyState from "@/components/dashboard/empty-state";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("*, folders(name), bookmark_tags(tag_id, tags(id, name, color))")
    .order("updated_at", { ascending: false })
    .limit(10);

  const { count: folderCount } = await supabase
    .from("folders")
    .select("*", { count: "exact", head: true });

  const { count: bookmarkCount } = await supabase
    .from("bookmarks")
    .select("*", { count: "exact", head: true });

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your bookmarks, folders, and tags
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard title="Total Bookmarks" value={bookmarkCount ?? 0} />
          <DashboardCard title="Total Folders" value={folderCount ?? 0} />
          <DashboardCard
            title="Recent Additions"
            value={
              bookmarks?.filter((b) => {
                const date = new Date(b.created_at);
                const now = new Date();
                const diff = now.getTime() - date.getTime();
                return diff < 7 * 24 * 60 * 60 * 1000; // 7 days
              }).length ?? 0
            }
          />
          <DashboardCard
            title="Unorganized"
            value={bookmarks?.filter((b) => !b.folder_id).length ?? 0}
          />
        </div>

        {/* Recent Bookmarks Section */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Recent Bookmarks
            </h2>
            <div className="flex items-center gap-2">
              {/* View options will go here */}
            </div>
          </div>

          {bookmarks && bookmarks.length > 0 ? (
            <BookmarkList bookmarks={bookmarks} />
          ) : (
            <EmptyState
              title="No bookmarks yet"
              description="Get started by creating your first bookmark."
              action={{
                label: "Add Bookmark",
                href: "/dashboard/bookmarks/new",
              }}
            />
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function DashboardCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col space-y-2">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        <div className="text-2xl sm:text-3xl font-bold tabular-nums">
          {value}
        </div>
      </div>
    </div>
  );
}
