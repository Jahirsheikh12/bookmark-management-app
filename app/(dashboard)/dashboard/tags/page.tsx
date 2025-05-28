"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import TagList from "@/components/dashboard/tag-list";
import EmptyState from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function TagsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [tags, setTags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTags = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/login");
        return;
      }

      const { data: tagsData } = await supabase
        .from("tags")
        .select(
          `
          *,
          bookmark_tags(count)
        `
        )
        .eq("user_id", session.session.user.id)
        .order("name");

      setTags(tagsData || []);
    } catch (error) {
      console.error("Error loading tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, [supabase, router]);

  const handleTagUpdate = () => {
    loadTags();
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-medium">Loading...</div>
            <div className="text-sm text-muted-foreground">
              Please wait while we load your tags
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
            <p className="text-muted-foreground">
              Manage and organize your bookmark tags
            </p>
          </div>
          <Link href="/dashboard/tags/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Tag
            </Button>
          </Link>
        </div>

        {tags && tags.length > 0 ? (
          <TagList tags={tags} onTagUpdate={handleTagUpdate} />
        ) : (
          <EmptyState
            title="No tags yet"
            description="Create your first tag to categorize your bookmarks."
            action={{
              label: "New Tag",
              href: "/dashboard/tags/new",
            }}
          />
        )}
      </div>
    </DashboardShell>
  );
}
