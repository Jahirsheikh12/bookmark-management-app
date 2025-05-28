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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Folder, ExternalLink } from "lucide-react";

interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  folder_id: string | null;
  folders?: {
    id: string;
    name: string;
  };
}

export default function MoveBookmarkPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient<Database>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          router.push("/login");
          return;
        }

        // Load bookmark data
        const { data: bookmarkData, error: bookmarkError } = await supabase
          .from("bookmarks")
          .select(
            `
            *,
            folders(id, name)
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
        setSelectedFolderId(bookmarkData.folder_id || "");

        // Load folders
        const { data: foldersData } = await supabase
          .from("folders")
          .select("id, name, parent_id")
          .eq("user_id", session.session.user.id)
          .order("name");

        if (foldersData) {
          setFolders(foldersData);
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

  const organizedFolders = folders.filter((folder) => !folder.parent_id);
  const subFolders = folders.filter((folder) => folder.parent_id);

  const getFolderPath = (folder: Folder): string => {
    if (!folder.parent_id) return folder.name;
    const parent = folders.find((f) => f.id === folder.parent_id);
    return parent ? `${parent.name} / ${folder.name}` : folder.name;
  };

  async function handleMove() {
    if (!bookmark) return;

    setIsLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("You must be logged in to move bookmarks.");
      }

      const { error } = await supabase
        .from("bookmarks")
        .update({
          folder_id: selectedFolderId || null,
        })
        .eq("id", params.id)
        .eq("user_id", session.session.user.id);

      if (error) {
        throw error;
      }

      const targetFolder = selectedFolderId
        ? folders.find((f) => f.id === selectedFolderId)?.name ||
          "Selected folder"
        : "No folder";

      toast({
        title: "Bookmark moved",
        description: `${bookmark.title} has been moved to ${targetFolder}.`,
      });

      router.push("/dashboard/bookmarks");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to move bookmark",
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

  if (!bookmark) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-medium">Bookmark not found</div>
            <div className="text-sm text-muted-foreground">
              The bookmark you&apos;re looking for doesn&apos;t exist
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
          <h1 className="text-2xl font-bold tracking-tight">Move Bookmark</h1>
          <p className="text-muted-foreground">
            Choose a new folder for your bookmark
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Bookmark Details</CardTitle>
            <CardDescription>
              Moving bookmark to a different folder
            </CardDescription>
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
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Folder className="h-3 w-3" />
                  <span>
                    Current folder: {bookmark.folders?.name || "No folder"}
                  </span>
                </div>
              </div>
            </div>

            {/* Folder selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none">
                Move to folder
              </label>
              <Select
                value={selectedFolderId}
                onValueChange={setSelectedFolderId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No folder</SelectItem>
                  {organizedFolders.map((folder) => (
                    <div key={folder.id}>
                      <SelectItem value={folder.id}>{folder.name}</SelectItem>
                      {subFolders
                        .filter((sub) => sub.parent_id === folder.id)
                        .map((subFolder) => (
                          <SelectItem
                            key={subFolder.id}
                            value={subFolder.id}
                            className="pl-6"
                          >
                            {getFolderPath(subFolder)}
                          </SelectItem>
                        ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current vs New folder comparison */}
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-sm mb-2">Current Location</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Folder className="h-4 w-4" />
                  <span>{bookmark.folders?.name || "No folder"}</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">New Location</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Folder className="h-4 w-4" />
                  <span>
                    {selectedFolderId
                      ? folders.find((f) => f.id === selectedFolderId)?.name ||
                        "Selected folder"
                      : "No folder"}
                  </span>
                </div>
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
                onClick={handleMove}
                disabled={
                  isLoading || selectedFolderId === (bookmark.folder_id || "")
                }
              >
                {isLoading ? "Moving..." : "Move Bookmark"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
