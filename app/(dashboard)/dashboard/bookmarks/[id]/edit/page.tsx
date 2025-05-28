"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required.",
  }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  description: z.string().optional(),
  notes: z.string().optional(),
  folderId: z.string().optional(),
});

interface Folder {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

export default function EditBookmarkPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient<Database>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
      description: "",
      notes: "",
      folderId: undefined,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          router.push("/login");
          return;
        }

        // Load bookmark data
        const { data: bookmark, error: bookmarkError } = await supabase
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

        // Populate form with bookmark data
        form.setValue("title", bookmark.title);
        form.setValue("url", bookmark.url);
        form.setValue("description", bookmark.description || "");
        form.setValue("notes", bookmark.notes || "");
        form.setValue("folderId", bookmark.folder_id || undefined);

        // Set selected tags
        const bookmarkTags =
          bookmark.bookmark_tags?.map((bt: any) => bt.tags.id) || [];
        setSelectedTags(bookmarkTags);

        // Load folders
        const { data: foldersData } = await supabase
          .from("folders")
          .select("id, name")
          .eq("user_id", session.session.user.id)
          .order("name");

        if (foldersData) {
          setFolders(foldersData);
        }

        // Load all tags
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
  }, [params.id, supabase, router, form]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const removeTag = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("You must be logged in to edit bookmarks.");
      }

      // Update bookmark
      const { error: updateError } = await supabase
        .from("bookmarks")
        .update({
          title: values.title,
          url: values.url,
          description: values.description || null,
          notes: values.notes || null,
          folder_id: values.folderId || null,
        })
        .eq("id", params.id)
        .eq("user_id", session.session.user.id);

      if (updateError) {
        throw updateError;
      }

      // Update tags
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
        title: "Bookmark updated",
        description: "Your bookmark has been updated successfully.",
      });

      router.push("/dashboard/bookmarks");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update bookmark",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

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

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Bookmark</h1>
          <p className="text-muted-foreground">Update your bookmark details</p>
        </div>

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
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Bookmark title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the bookmark"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Personal notes about this bookmark"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="folderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Folder</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a folder (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="No folder">No folder</SelectItem>
                          {folders.map((folder) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Bookmark"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
