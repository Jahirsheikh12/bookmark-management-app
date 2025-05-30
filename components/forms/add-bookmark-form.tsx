"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Globe, Tag as TagIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TextField,
  TextareaField,
  FormContainer,
} from "@/components/forms/form-field-wrapper";
import { useCreateBookmark } from "@/hooks/use-bookmarks";
import { useFolders } from "@/hooks/use-folders";
import { useTags } from "@/hooks/use-tags";
import { useUserPreferences } from "@/hooks/use-user";
import { bookmarkFormSchema, type BookmarkFormData } from "@/lib/validations";
import { Folder, Tag } from "@/types/bookmark";
import { PageLoading } from "@/components/ui/loading";
import { fetchBookmarkMetadata, normalizeUrl } from "@/lib/utils/metadata";

interface AddBookmarkFormProps {
  initialUrl?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddBookmarkForm({
  initialUrl = "",
  onSuccess,
  onCancel,
}: AddBookmarkFormProps) {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);

  const form = useForm<BookmarkFormData>({
    resolver: zodResolver(bookmarkFormSchema),
    defaultValues: {
      title: "",
      url: initialUrl,
      description: "",
      notes: "",
      folderId: "",
    },
  });

  // Load data
  const { data: folders = [], isLoading: loadingFolders } = useFolders();
  const { data: allTags = [], isLoading: loadingTags } = useTags();
  const { data: preferences } = useUserPreferences();

  // Create bookmark mutation
  const createBookmarkMutation = useCreateBookmark();

  // Extract metadata from URL when URL changes
  useEffect(() => {
    const extractMetadata = async (url: string) => {
      if (!url || !preferences?.auto_fetch_metadata) return;

      // Normalize URL (add https if missing)
      const normalizedUrl = normalizeUrl(url);
      if (normalizedUrl !== url) {
        form.setValue("url", normalizedUrl);
      }

      if (!normalizedUrl.startsWith("http")) return;

      setIsExtractingMetadata(true);
      try {
        const metadata = await fetchBookmarkMetadata(normalizedUrl);

        // Only set title if it's empty
        if (!form.getValues("title") && metadata.title) {
          form.setValue("title", metadata.title);
        }

        // Only set description if it's empty
        if (!form.getValues("description") && metadata.description) {
          form.setValue("description", metadata.description);
        }
      } catch (error) {
        console.error("Failed to extract metadata:", error);
        // Fallback to hostname if metadata extraction fails
        try {
          const hostname = new URL(normalizedUrl).hostname;
          if (!form.getValues("title")) {
            form.setValue("title", hostname.replace("www.", ""));
          }
        } catch {
          // Ignore URL parsing errors
        }
      } finally {
        setIsExtractingMetadata(false);
      }
    };

    const url = form.watch("url");
    if (url && url !== initialUrl) {
      const timeoutId = setTimeout(() => extractMetadata(url), 1000); // Debounce
      return () => clearTimeout(timeoutId);
    }
  }, [form.watch("url"), form, initialUrl, preferences?.auto_fetch_metadata]);

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
    createBookmarkMutation.mutate(values, {
      onSuccess: () => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/bookmarks");
        }
      },
    });
    // TODO: Handle tag associations - would need API endpoint for this
  }

  // Show loading state while fetching data
  if (loadingFolders || loadingTags) {
    return <PageLoading text="Loading form data..." />;
  }

  return (
    <FormContainer
      title="Add Bookmark"
      description="Save a new bookmark to your collection"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Bookmark Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TextField
                control={form.control}
                name="url"
                label="URL"
                type="url"
                placeholder="https://example.com"
                description="The web address you want to bookmark"
                icon={<Globe className="h-4 w-4" />}
              />

              <TextField
                control={form.control}
                name="title"
                label="Title"
                placeholder={
                  isExtractingMetadata
                    ? "Extracting title..."
                    : "Enter bookmark title"
                }
                description="A descriptive title for your bookmark"
                disabled={isExtractingMetadata}
              />

              <TextareaField
                control={form.control}
                name="description"
                label="Description"
                placeholder="Brief description of the bookmark"
                description="Optional description to help you remember what this bookmark is about"
                rows={3}
              />

              <TextareaField
                control={form.control}
                name="notes"
                label="Personal Notes"
                placeholder="Add your personal notes..."
                description="Private notes that only you can see"
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
                <p className="text-xs text-muted-foreground">
                  Organize your bookmark by placing it in a folder
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium leading-none flex items-center gap-2">
                  <TagIcon className="h-4 w-4" />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 border rounded-md bg-muted/20">
                  {allTags.length > 0 ? (
                    allTags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag.id}
                          checked={selectedTags.includes(tag.id)}
                          onCheckedChange={() => toggleTag(tag.id)}
                        />
                        <label
                          htmlFor={tag.id}
                          className="text-sm font-medium leading-none cursor-pointer flex-1"
                          style={{ color: tag.color || undefined }}
                        >
                          {tag.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground col-span-2 text-center py-4">
                      No tags available. Create some tags first to organize your
                      bookmarks.
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tag your bookmark to make it easier to find later
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel || (() => router.back())}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createBookmarkMutation.isPending || isExtractingMetadata
                  }
                >
                  {createBookmarkMutation.isPending
                    ? "Adding..."
                    : "Add Bookmark"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </FormContainer>
  );
}
