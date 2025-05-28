"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { Database } from "@/types/supabase";
import { ArrowLeft, Edit, Tag, Plus } from "lucide-react";
import { BookmarkWithRelations } from "@/types/bookmark";
import BookmarkList from "@/components/dashboard/bookmark-list";
import Link from "next/link";
import EmptyState from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";

interface TagData {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
  bookmark_tags: {
    bookmarks: BookmarkWithRelations;
  }[];
}

export default function TagDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient<Database>();
  const [tag, setTag] = useState<TagData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTagData = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/login");
        return;
      }

      const { data: tagData, error } = await supabase
        .from("tags")
        .select(
          `
          *,
          bookmark_tags(
            bookmarks(
              *,
              folders(id, name),
              bookmark_tags(
                tags(id, name, color)
              )
            )
          )
        `
        )
        .eq("id", params.id)
        .eq("user_id", session.session.user.id)
        .single();

      if (error) {
        console.error("Error loading tag:", error);
        router.push("/dashboard/tags");
        return;
      }

      setTag(tagData);
    } catch (error) {
      console.error("Error loading tag:", error);
      router.push("/dashboard/tags");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadTagData();
    }
  }, [params.id, supabase, router]);

  const handleBookmarkUpdate = () => {
    // Refresh tag data when a bookmark is updated
    loadTagData();
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-medium">Loading...</div>
            <div className="text-sm text-muted-foreground">
              Please wait while we load your tag
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!tag) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-medium">Tag not found</div>
            <div className="text-sm text-muted-foreground">
              The tag you are looking for does not exist
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const bookmarks = tag.bookmark_tags?.map((bt) => bt.bookmarks) || [];

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1"
                >
                  {tag.color && (
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                  )}
                  <Tag className="h-4 w-4" />
                  {tag.name}
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Created on {formatDate(tag.created_at)} • {bookmarks.length}{" "}
                bookmarks
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/tags/${tag.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Tag
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link
                href="/dashboard/bookmarks/new"
                className="inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bookmark
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Bookmarks with this tag ({bookmarks.length})
            </h2>
          </div>

          {bookmarks.length > 0 ? (
            <BookmarkList
              bookmarks={bookmarks}
              onBookmarkUpdate={handleBookmarkUpdate}
            />
          ) : (
            <EmptyState
              title="No bookmarks with this tag"
              description="This tag hasn't been applied to any bookmarks yet. Add this tag to some bookmarks to see them here."
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
