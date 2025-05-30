"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useBookmark, useUpdateBookmark } from "@/hooks/use-bookmarks";
import { useFolders } from "@/hooks/use-folders";
import { useTags } from "@/hooks/use-tags";
import { bookmarkFormSchema, type BookmarkFormData } from "@/lib/validations";
import {
  TextField,
  TextareaField,
  FormContainer,
} from "@/components/forms/form-field-wrapper";
import { BookmarkWithRelations, Folder, Tag } from "@/types/bookmark";

export default function EditBookmarkPage() {
  const router = useRouter();
  const params = useParams();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const form = useForm<BookmarkFormData>({
    resolver: zodResolver(bookmarkFormSchema),
    defaultValues: {
      title: "",
      url: "",
      description: "",
      notes: "",
      folderId: "",
    },
  });

  // Load bookmark data
  const {
    data: bookmark,
    isLoading: loadingBookmark,
    error: bookmarkError,
  } = useBookmark(params.id as string);

  // Load folders
  const { data: folders = [] } = useFolders();

  // Load tags
  const { data: allTags = [] } = useTags();

  // Update bookmark mutation
  const updateBookmarkMutation = useUpdateBookmark();

  // Populate form when bookmark data loads
  useEffect(() => {
    if (bookmark) {
      form.setValue("title", bookmark.title);
      form.setValue("url", bookmark.url);
      form.setValue("description", bookmark.description || "");
      form.setValue("notes", bookmark.notes || "");
      form.setValue("folderId", bookmark.folder_id || "");

      // Set selected tags
      const bookmarkTags =
        bookmark.bookmark_tags?.map((bt) => bt.tags.id) || [];
      setSelectedTags(bookmarkTags);
    }
  }, [bookmark, form]);

  // Handle tag toggle
  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Handle tag removal
  const removeTag = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };

  // Handle form submission
  async function onSubmit(values: BookmarkFormData) {
    updateBookmarkMutation.mutate(
      { id: params.id as string, data: values },
      {
        onSuccess: () => {
          router.push("/dashboard/bookmarks");
        },
      }
    );

    // TODO: Update tags - this would need a separate API endpoint
    // For now, we'll handle this with direct Supabase calls
    // In a production app, you'd want to create a proper API endpoint for this
  }

  if (loadingBookmark) {
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

  if (bookmarkError) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-medium text-destructive">Error</div>
            <div className="text-sm text-muted-foreground">
              Failed to load bookmark: {bookmarkError.message}
            </div>
            <Button
              onClick={() => router.push("/dashboard/bookmarks")}
              className="mt-4"
            >
              Back to Bookmarks
            </Button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <FormContainer
        title="Edit Bookmark"
        description="Update your bookmark details"
      >
        <Card>
          <CardHeader>
            <CardTitle>Bookmark Details</CardTitle>
            <CardDescription>
              Update the information for your bookmark
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <TextField
                  control={form.control}
                  name="title"
                  label="Title"
                  placeholder="Bookmark title"
                />

                <TextField
                  control={form.control}
                  name="url"
                  label="URL"
                  type="url"
                  placeholder="https://example.com"
                />

                <TextareaField
                  control={form.control}
                  name="description"
                  label="Description"
                  placeholder="Brief description of the bookmark"
                  rows={3}
                />

                <TextareaField
                  control={form.control}
                  name="notes"
                  label="Notes"
                  placeholder="Personal notes about this bookmark"
                  rows={3}
                />

                <div className="space-y-3">
                  <label className="text-sm font-medium leading-none">
                    Folder
                  </label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue(
                        "folderId",
                        value === "no-folder" ? "" : value
                      )
                    }
                    value={form.watch("folderId") || "no-folder"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a folder (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-folder">No folder</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium leading-none">
                    Tags
                  </label>

                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tagId) => {
                        const tag = allTags.find((t) => t.id === tagId);
                        if (!tag) return null;
                        return (
                          <Badge
                            key={tagId}
                            variant="secondary"
                            className="flex items-center gap-1"
                            style={{ borderColor: tag.color || undefined }}
                          >
                            {tag.name}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => removeTag(tagId)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                    {allTags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag.id}
                          checked={selectedTags.includes(tag.id)}
                          onCheckedChange={() => toggleTag(tag.id)}
                        />
                        <label
                          htmlFor={tag.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {tag.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateBookmarkMutation.isPending}
                  >
                    {updateBookmarkMutation.isPending
                      ? "Updating..."
                      : "Update Bookmark"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </FormContainer>
    </DashboardShell>
  );
}
