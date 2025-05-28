"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  bookmark_tags?: {
    tags: Tag;
  }[];
}

export default function ManageBookmarkTagsPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient<Database>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          router.push("/login");
          return;
        }

        // Load bookmark data with current tags
        const { data: bookmarkData, error: bookmarkError } = await supabase
          .from("bookmarks")
          .select(
            `
            *,
            bookmark_tags(
              tags(id, name, color)
            )
          `
          )
          .eq("id", params.id)
          .eq("user_id", session.session.user.id)
          .single();

        if (bookmarkError) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load bookmark data.",
          });
          router.push("/dashboard/bookmarks");
          return;
        }

        setBookmark(bookmarkData);

        // Set currently selected tags
        const currentTags =
          bookmarkData.bookmark_tags?.map((bt: any) => bt.tags.id) || [];
        setSelectedTags(currentTags);

        // Load all available tags
        const { data: tagsData } = await supabase
          .from("tags")
          .select("id, name, color")
          .eq("user_id", session.session.user.id)
          .order("name");

        if (tagsData) {
          setAllTags(tagsData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data.",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    if (params.id) {
      loadData();
    }
  }, [params.id, supabase, router]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const createNewTag = async () => {
    if (!newTagName.trim()) return;

    setIsCreatingTag(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("You must be logged in to create tags.");
      }

      const { data: newTag, error } = await supabase
        .from("tags")
        .insert({
          name: newTagName.trim(),
          user_id: session.session.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to available tags and select it
      setAllTags((prev) =>
        [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name))
      );
      setSelectedTags((prev) => [...prev, newTag.id]);
      setNewTagName("");

      toast({
        title: "Tag created",
        description: `Tag "${newTag.name}" has been created and added.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create tag",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleSave = async () => {
    if (!bookmark) return;

    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("You must be logged in to manage tags.");
      }

      // First, delete existing tag associations
      await supabase
        .from("bookmark_tags")
        .delete()
        .eq("bookmark_id", params.id);

      // Then add new tag associations
      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map((tagId) => ({
          bookmark_id: params.id as string,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from("bookmark_tags")
          .insert(tagInserts);

        if (tagsError) {
          throw tagsError;
        }
      }

      toast({
        title: "Tags updated",
        description: "Bookmark tags have been updated successfully.",
      });

      router.push("/dashboard/bookmarks");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update tags",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
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

  const selectedTagObjects = allTags.filter((tag) =>
    selectedTags.includes(tag.id)
  );

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Tags</h1>
          <p className="text-muted-foreground">
            Add or remove tags for your bookmark
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Bookmark Details</CardTitle>
            <CardDescription>Managing tags for your bookmark</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current bookmark info */}
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/20">
              <ExternalLink className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{bookmark.title}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {new URL(bookmark.url).hostname}
                </p>
              </div>
            </div>

            {/* Selected tags */}
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none">
                Selected Tags ({selectedTags.length})
              </label>
              {selectedTagObjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedTagObjects.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag.color && (
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                      )}
                      {tag.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => toggleTag(tag.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tags selected
                </p>
              )}
            </div>

            {/* Create new tag */}
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none">
                Create New Tag
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      createNewTag();
                    }
                  }}
                />
                <Button
                  onClick={createNewTag}
                  disabled={!newTagName.trim() || isCreatingTag}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {isCreatingTag ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>

            {/* Available tags */}
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none">
                Available Tags
              </label>
              {allTags.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-3 border rounded-md bg-muted/10">
                  {allTags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag.id}
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id)}
                      />
                      <label
                        htmlFor={tag.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2 flex-1"
                      >
                        {tag.color && (
                          <span
                            className="h-2 w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tag.color }}
                          />
                        )}
                        {tag.name}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tags available. Create your first tag above.
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Tags"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
