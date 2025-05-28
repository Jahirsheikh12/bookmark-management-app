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

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Tag name is required.",
  }),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, {
      message: "Please enter a valid hex color.",
    })
    .optional(),
});

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

export default function EditTagPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient<Database>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#3B82F6",
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

        // Load current tag
        const { data: tag, error: tagError } = await supabase
          .from("tags")
          .select("*")
          .eq("id", params.id)
          .eq("user_id", session.session.user.id)
          .single();

        if (tagError) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load tag data.",
          });
          router.push("/dashboard/tags");
          return;
        }

        setCurrentTag(tag);
        form.setValue("name", tag.name);
        form.setValue("color", tag.color || "#3B82F6");
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
        throw new Error("You must be logged in to edit tags.");
      }

      const { error } = await supabase
        .from("tags")
        .update({
          name: values.name,
          color: values.color || null,
        })
        .eq("id", params.id)
        .eq("user_id", session.session.user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Tag updated",
        description: "Your tag has been updated successfully.",
      });

      router.push(`/dashboard/tags/${params.id}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update tag",
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
              Please wait while we load your tag
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!currentTag) {
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

  const colorOptions = [
    "#3B82F6", // Blue
    "#EF4444", // Red
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#8B5CF6", // Purple
    "#F97316", // Orange
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#EC4899", // Pink
    "#6B7280", // Gray
  ];

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Tag</h1>
          <p className="text-muted-foreground">Update your tag details</p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Tag Details</CardTitle>
            <CardDescription>
              Update the information for your tag
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
                        <Input placeholder="Tag name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Input
                            type="color"
                            placeholder="#3B82F6"
                            {...field}
                            className="w-20 h-10"
                          />
                          <div className="grid grid-cols-5 gap-2">
                            {colorOptions.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                                style={{ backgroundColor: color }}
                                onClick={() => field.onChange(color)}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      </FormControl>
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
                    {isLoading ? "Updating..." : "Update Tag"}
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
