"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Database } from "@/types/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  title: z.string().min(1, {
    message: "Title is required.",
  }),
  description: z.string().optional(),
  notes: z.string().optional(),
  folderId: z.string().optional(),
});

const NO_FOLDER_VALUE = "NO_FOLDER";

type Folder = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_id: string | null;
};

export default function NewBookmarkPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  const [isLoading, setIsLoading] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);

  // Fetch folders for the current user
  useEffect(() => {
    const fetchFolders = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: foldersData } = await supabase
          .from("folders")
          .select("*")
          .order("name");

        if (foldersData) {
          setFolders(foldersData);
        }
      }
    };

    fetchFolders();
  }, [supabase]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      title: "",
      description: "",
      notes: "",
      folderId: NO_FOLDER_VALUE,
    },
  });

  // Function to fetch metadata when URL is entered
  const fetchMetadata = async (url: string) => {
    try {
      // This would be replaced with an actual API call to your metadata scraper
      form.setValue("title", new URL(url).hostname);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error("You must be logged in to create a bookmark.");
      }

      const { data, error } = await supabase
        .from("bookmarks")
        .insert({
          url: values.url,
          title: values.title,
          description: values.description || null,
          notes: values.notes || null,
          folder_id:
            values.folderId === NO_FOLDER_VALUE
              ? null
              : values.folderId || null,
          user_id: sessionData.session.user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Bookmark created",
        description: "Your bookmark has been saved successfully.",
      });

      router.push("/dashboard/bookmarks");
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create bookmark",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Add New Bookmark
          </h1>
          <p className="text-muted-foreground">
            Save a new webpage to your bookmark collection
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bookmark Details</CardTitle>
            <CardDescription>
              Enter the URL and details of the webpage you want to save
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
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com"
                          {...field}
                          onBlur={(e) => {
                            field.onBlur();
                            if (e.target.value) {
                              fetchMetadata(e.target.value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        The website address you want to bookmark
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Website" {...field} />
                      </FormControl>
                      <FormDescription>
                        A title to identify this bookmark
                      </FormDescription>
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
                          placeholder="Brief description of the website"
                          className="resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: A short description of what this website is
                        about
                      </FormDescription>
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
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: Personal notes or reminders about this
                        bookmark
                      </FormDescription>
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a folder (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NO_FOLDER_VALUE}>
                            No folder
                          </SelectItem>
                          {folders.map((folder) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose a folder to organize your bookmark
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Bookmark"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
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
