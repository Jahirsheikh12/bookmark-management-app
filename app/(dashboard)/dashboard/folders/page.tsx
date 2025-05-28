"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import FolderList from "@/components/dashboard/folder-list";
import EmptyState from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
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
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-medium">Loading...</div>
            <div className="text-sm text-muted-foreground">
              Please wait while we load your folders
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Folders</h1>
            <p className="text-muted-foreground">
              Organize your bookmarks into folders
            </p>
          </div>
          <Link href="/dashboard/folders/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          </Link>
        </div>

        {folders && folders.length > 0 ? (
          <FolderList folders={folders} onFolderUpdate={handleFolderUpdate} />
        ) : (
          <EmptyState
            title="No folders yet"
            description="Create your first folder to organize your bookmarks."
            action={{
              label: "New Folder",
              href: "/dashboard/folders/new",
            }}
          />
        )}
      </div>
    </DashboardShell>
  );
}
