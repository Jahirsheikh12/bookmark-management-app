"use client";

import { useRouter } from "next/navigation";
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
  name: z.string().min(1, {
    message: "Folder name is required.",
  }),
  parentId: z.string().optional(),
});

export default function NewFolderPage() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [isLoading, setIsLoading] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);

  // Fetch folders for parent selection
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
      name: "",
      parentId: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error("You must be logged in to create a folder.");
      }

      const { data, error } = await supabase
        .from("folders")
        .insert({
          name: values.name,
          parent_id: values.parentId || null,
          user_id: sessionData.session.user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Folder created",
        description: "Your folder has been created successfully.",
      });

      router.push("/dashboard/folders");
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create folder",
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
            Create New Folder
          </h1>
          <p className="text-muted-foreground">
            Create a new folder to organize your bookmarks
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Folder Details</CardTitle>
            <CardDescription>
              Enter the details for your new folder
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
                        <Input placeholder="My Folder" {...field} />
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a parent folder (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                  <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Folder"}
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
