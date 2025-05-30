"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import FolderList from "@/components/dashboard/folder-list";
import EmptyState from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { FolderCardSkeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function FoldersPage() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [folders, setFolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFolders = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/login");
        return;
      }

      const { data: foldersData } = await supabase
        .from("folders")
        .select(
          `
          *,
          bookmarks(count)
        `
        )
        .eq("user_id", session.session.user.id)
        .order("name");

      setFolders(foldersData || []);
    } catch (error) {
      console.error("Error loading folders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, [supabase, router]);

  const handleFolderUpdate = () => {
    loadFolders();
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-8 w-32 bg-primary/10 rounded animate-pulse" />
              <div className="h-5 w-64 bg-primary/10 rounded animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-primary/10 rounded animate-pulse" />
          </div>

          {/* Folder Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <FolderCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Folders
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Organize your bookmarks into folders
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/folders/new">
              <Plus className="mr-2 h-4 w-4" />
              New Folder
            </Link>
          </Button>
        </div>

        {/* Folders Content */}
        {folders.length > 0 ? (
          <FolderList folders={folders} onFolderUpdate={handleFolderUpdate} />
        ) : (
          <EmptyState
            title="No folders yet"
            description="Create your first folder to organize your bookmarks."
            action={{
              label: "Create Folder",
              href: "/dashboard/folders/new",
            }}
          />
        )}
      </div>
    </DashboardShell>
  );
}
