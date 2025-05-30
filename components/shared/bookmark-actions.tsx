"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Edit, Folder, MoreHorizontal, Tag, Trash } from "lucide-react";
import { BookmarkWithRelations } from "@/types/bookmark";
import { useDeleteBookmark } from "@/hooks/use-bookmarks";

interface BookmarkActionsProps {
  bookmark: BookmarkWithRelations;
  onUpdate?: () => void;
}

export function BookmarkActions({ bookmark, onUpdate }: BookmarkActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteBookmarkMutation = useDeleteBookmark();

  const handleEdit = () => {
    router.push(`/dashboard/bookmarks/${bookmark.id}/edit`);
  };

  const handleMove = () => {
    router.push(`/dashboard/bookmarks/${bookmark.id}/move`);
  };

  const handleTag = () => {
    router.push(`/dashboard/bookmarks/${bookmark.id}/tags`);
  };

  const handleDelete = () => {
    deleteBookmarkMutation.mutate(bookmark.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        if (onUpdate) {
          onUpdate();
        } else {
          router.refresh();
        }
      },
    });
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
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleMove}>
            <Folder className="mr-2 h-4 w-4" />
            <span>Move</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleTag}>
            <Tag className="mr-2 h-4 w-4" />
            <span>Manage Tags</span>
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              bookmark &ldquo;{bookmark.title}&rdquo; and remove all its
              associated tags.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteBookmarkMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBookmarkMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
