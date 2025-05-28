"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { Database } from "@/types/supabase";
import { ArrowLeft, Edit, Folder, Plus } from "lucide-react";
import { BookmarkWithRelations } from "@/types/bookmark";
import BookmarkList from "@/components/dashboard/bookmark-list";
import Link from "next/link";
import EmptyState from "@/components/dashboard/empty-state";

interface FolderData {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  bookmarks: BookmarkWithRelations[];
}

export default function FolderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient<Database>();
  const [folder, setFolder] = useState<FolderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFolderData = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/login");
        return;
      }

      const { data: folderData, error } = await supabase
        .from("folders")
        .select(
          `
          *,
          bookmarks(
            *,
            folders(id, name),
            bookmark_tags(
              tags(id, name, color)
            )
          )
        `
        )
        .eq("id", params.id)
        .eq("user_id", session.session.user.id)
        .single();

      if (error) {
        console.error("Error loading folder:", error);
        router.push("/dashboard/folders");
        return;
      }

      setFolder(folderData);
    } catch (error) {
      console.error("Error loading folder:", error);
      router.push("/dashboard/folders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadFolderData();
    }
  }, [params.id, supabase, router]);

  const handleBookmarkUpdate = () => {
    // Refresh folder data when a bookmark is updated
    loadFolderData();
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-medium">Loading...</div>
            <div className="text-sm text-muted-foreground">
              Please wait while we load your folder
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!folder) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-medium">Folder not found</div>
            <div className="text-sm text-muted-foreground">
              The folder you are looking for does not exist
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
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Folder className="h-6 w-6" />
                {folder.name}
              </h1>
              <p className="text-muted-foreground">
                Created on {formatDate(folder.created_at)} •{" "}
                {folder.bookmarks?.length || 0} bookmarks
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/folders/${folder.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Folder
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

        {folder.description && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm">{folder.description}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Bookmarks ({folder.bookmarks?.length || 0})
            </h2>
          </div>

          {folder.bookmarks && folder.bookmarks.length > 0 ? (
            <BookmarkList
              bookmarks={folder.bookmarks}
              onBookmarkUpdate={handleBookmarkUpdate}
            />
          ) : (
            <EmptyState
              title="No bookmarks in this folder"
              description="This folder is empty. Add some bookmarks to get started."
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
