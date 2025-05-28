import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import BookmarkList from "@/components/dashboard/bookmark-list";
import EmptyState from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function BookmarksPage() {
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
    .order("created_at", { ascending: false });

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">All Bookmarks</h1>
            <p className="text-muted-foreground">
              Browse and manage all your saved bookmarks
            </p>
          </div>
          <Link href="/dashboard/bookmarks/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Bookmark
            </Button>
          </Link>
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
    </DashboardShell>
  );
}
