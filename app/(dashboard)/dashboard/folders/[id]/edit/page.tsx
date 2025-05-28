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

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Folder name is required.",
  }),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

interface Folder {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
}

export default function EditFolderPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient<Database>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      parentId: undefined,
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

        // Load current folder
        const { data: folder, error: folderError } = await supabase
          .from("folders")
          .select("*")
          .eq("id", params.id)
          .eq("user_id", session.session.user.id)
          .single();

        if (folderError) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load folder data.",
          });
          router.push("/dashboard/folders");
          return;
        }

        setCurrentFolder(folder);
        form.setValue("name", folder.name);
        form.setValue("description", folder.description || "");
        form.setValue("parentId", folder.parent_id || undefined);

        // Load all folders for parent selection (excluding current folder and its children)
        const { data: foldersData } = await supabase
          .from("folders")
          .select("id, name, description, parent_id")
          .eq("user_id", session.session.user.id)
          .neq("id", params.id)
          .order("name");

        if (foldersData) {
          // Filter out folders that would create circular dependencies
          const filteredFolders = foldersData.filter(
            (f) => f.parent_id !== params.id
          );
          setFolders(filteredFolders);
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("You must be logged in to edit folders.");
      }

      const { error } = await supabase
        .from("folders")
        .update({
          name: values.name,
          description: values.description || null,
          parent_id: values.parentId || null,
        })
        .eq("id", params.id)
        .eq("user_id", session.session.user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Folder updated",
        description: "Your folder has been updated successfully.",
      });

      router.push(`/dashboard/folders/${params.id}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update folder",
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
              Please wait while we load your folder
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!currentFolder) {
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

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Folder</h1>
          <p className="text-muted-foreground">Update your folder details</p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Folder Details</CardTitle>
            <CardDescription>
              Update the information for your folder
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Folder name" {...field} />
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
                          placeholder="Brief description of the folder (optional)"
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
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Folder</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a parent folder (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="No parent folder">
                            No parent folder
                          </SelectItem>
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

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Folder"}
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
