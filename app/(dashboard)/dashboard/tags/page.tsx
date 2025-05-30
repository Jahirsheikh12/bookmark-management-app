"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import TagList from "@/components/dashboard/tag-list";
import EmptyState from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { TagCardSkeleton } from "@/components/ui/skeleton";
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
        <div className="space-y-8">
          {/* Header Section */}
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

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Tags
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your bookmark tags
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/tags/new">
              <Plus className="mr-2 h-4 w-4" />
              New Tag
            </Link>
          </Button>
        </div>

        {/* Tags Content */}
        {tags.length > 0 ? (
          <TagList tags={tags} onTagUpdate={handleTagUpdate} />
        ) : (
          <EmptyState
            title="No tags yet"
            description="Create your first tag to categorize your bookmarks."
            action={{
              label: "Create Tag",
              href: "/dashboard/tags/new",
            }}
          />
        )}
      </div>
    </DashboardShell>
  );
}
