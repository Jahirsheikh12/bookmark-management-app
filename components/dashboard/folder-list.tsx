"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Folder, MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface FolderProps {
  folders: any[];
  onFolderUpdate?: () => void;
}

export default function FolderList({ folders, onFolderUpdate }: FolderProps) {
  const [view, setView] = useState<"grid" | "list">("grid");

  if (!folders || folders.length === 0) {
    return <div className="text-center py-10">No folders found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {folders.map((folder) => (
        <FolderCard
          key={folder.id}
          folder={folder}
          onFolderUpdate={onFolderUpdate}
        />
      ))}
    </div>
  );
}

function FolderCard({
  folder,
  onFolderUpdate,
}: {
  folder: any;
  onFolderUpdate?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">
            <Link
              href={`/dashboard/folders/${folder.id}`}
              className="hover:underline flex items-center gap-2"
            >
              <Folder className="h-4 w-4" />
              {folder.name}
            </Link>
          </CardTitle>
          <FolderActions folder={folder} onFolderUpdate={onFolderUpdate} />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {folder.bookmarks?.count || 0} bookmarks
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FolderActions({
  folder,
  onFolderUpdate,
}: {
  folder: any;
  onFolderUpdate?: () => void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const handleEdit = () => {
    router.push(`/dashboard/folders/${folder.id}/edit`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("You must be logged in to delete folders.");
      }

      // Check if folder has bookmarks
      const { data: bookmarks } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("folder_id", folder.id)
        .limit(1);

      if (bookmarks && bookmarks.length > 0) {
        toast({
          variant: "destructive",
          title: "Cannot delete folder",
          description:
            "This folder contains bookmarks. Please move or delete the bookmarks first.",
        });
        setShowDeleteDialog(false);
        setIsDeleting(false);
        return;
      }

      // Check if folder has subfolders
      const { data: subfolders } = await supabase
        .from("folders")
        .select("id")
        .eq("parent_id", folder.id)
        .limit(1);

      if (subfolders && subfolders.length > 0) {
        toast({
          variant: "destructive",
          title: "Cannot delete folder",
          description:
            "This folder contains subfolders. Please move or delete the subfolders first.",
        });
        setShowDeleteDialog(false);
        setIsDeleting(false);
        return;
      }

      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", folder.id)
        .eq("user_id", session.session.user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Folder deleted",
        description: `${folder.name} has been deleted successfully.`,
      });

      setShowDeleteDialog(false);
      if (onFolderUpdate) {
        onFolderUpdate();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete folder",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the folder &ldquo;{folder.name}
              &rdquo;? This action cannot be undone.
              {folder.bookmarks?.count > 0 && (
                <span className="block mt-2 text-orange-600">
                  Note: This folder contains {folder.bookmarks.count}{" "}
                  bookmark(s) that will need to be moved or deleted first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
