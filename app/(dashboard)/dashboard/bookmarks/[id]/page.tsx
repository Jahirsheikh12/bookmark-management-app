"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database } from "@/types/supabase";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Edit,
  Folder as FolderIcon,
  Tag as TagIcon,
  ArrowLeft,
  Calendar,
  Globe,
} from "lucide-react";
import { BookmarkWithRelations } from "@/types/bookmark";
import Link from "next/link";

export default function BookmarkDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient<Database>();
  const [bookmark, setBookmark] = useState<BookmarkWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBookmark = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          router.push("/login");
          return;
        }

        const { data: bookmarkData, error } = await supabase
          .from("bookmarks")
          .select(
            `
            *,
            folders(id, name),
            bookmark_tags(
              tags(id, name, color)
            )
          `
          )
          .eq("id", params.id)
          .eq("user_id", session.session.user.id)
          .single();

        if (error) {
          console.error("Error loading bookmark:", error);
          router.push("/dashboard/bookmarks");
          return;
        }

        setBookmark(bookmarkData);
      } catch (error) {
        console.error("Error loading bookmark:", error);
        router.push("/dashboard/bookmarks");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadBookmark();
    }
  }, [params.id, supabase, router]);

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-medium">Loading...</div>
            <div className="text-sm text-muted-foreground">
              Please wait while we load your bookmark
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!bookmark) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-medium">Bookmark not found</div>
            <div className="text-sm text-muted-foreground">
              The bookmark you are looking for does not exist
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
      hour: "2-digit",
      minute: "2-digit",
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
              <h1 className="text-2xl font-bold tracking-tight">
                Bookmark Details
              </h1>
              <p className="text-muted-foreground">
                View and manage your bookmark
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/bookmarks/${bookmark.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-xl">{bookmark.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {new URL(bookmark.url).hostname}
                    </CardDescription>
                  </div>
                  {bookmark.favicon && (
                    <img
                      src={bookmark.favicon}
                      alt=""
                      className="h-8 w-8 rounded border bg-white p-1"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">URL</h3>
                  <div className="p-3 bg-muted rounded-md">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono break-all hover:underline text-blue-600"
                    >
                      {bookmark.url}
                    </a>
                  </div>
                </div>

                {bookmark.description && (
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {bookmark.description}
                    </p>
                  </div>
                )}

                {bookmark.notes && (
                  <div>
                    <h3 className="font-medium mb-2">Notes</h3>
                    <div className="p-3 bg-muted/50 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">
                        {bookmark.notes}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <FolderIcon className="h-4 w-4" />
                    Folder
                  </div>
                  {bookmark.folders ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{bookmark.folders.name}</Badge>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/bookmarks/${bookmark.id}/move`}>
                          Change
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        No folder
                      </span>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/bookmarks/${bookmark.id}/move`}>
                          Add to folder
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <TagIcon className="h-4 w-4" />
                    Tags
                  </div>
                  {bookmark.bookmark_tags &&
                  bookmark.bookmark_tags.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {bookmark.bookmark_tags.map((bookmarkTag) => (
                          <Badge key={bookmarkTag.tags.id} variant="secondary">
                            {bookmarkTag.tags.color && (
                              <span
                                className="h-2 w-2 rounded-full mr-1"
                                style={{
                                  backgroundColor: bookmarkTag.tags.color,
                                }}
                              />
                            )}
                            {bookmarkTag.tags.name}
                          </Badge>
                        ))}
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/bookmarks/${bookmark.id}/tags`}>
                          Manage tags
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        No tags
                      </span>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/bookmarks/${bookmark.id}/tags`}>
                          Add tags
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(bookmark.created_at)}</span>
                </div>
                {bookmark.updated_at !== bookmark.created_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Updated:</span>
                    <span>{formatDate(bookmark.updated_at)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
