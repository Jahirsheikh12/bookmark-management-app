"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, MoreHorizontal, Tag, Trash } from "lucide-react";
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

interface TagProps {
  tags: any[];
  onTagUpdate?: () => void;
}

export default function TagList({ tags, onTagUpdate }: TagProps) {
  const [view, setView] = useState<"grid" | "list">("grid");

  if (!tags || tags.length === 0) {
    return <div className="text-center py-10">No tags found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tags.map((tag) => (
        <TagCard key={tag.id} tag={tag} onTagUpdate={onTagUpdate} />
      ))}
    </div>
  );
}

function TagCard({ tag, onTagUpdate }: { tag: any; onTagUpdate?: () => void }) {
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
              href={`/dashboard/tags/${tag.id}`}
              className="hover:underline flex items-center gap-2"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </Link>
          </CardTitle>
          <TagActions tag={tag} onTagUpdate={onTagUpdate} />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {tag.bookmark_tags?.count || 0} bookmarks
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TagActions({
  tag,
  onTagUpdate,
}: {
  tag: any;
  onTagUpdate?: () => void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const handleEdit = () => {
    router.push(`/dashboard/tags/${tag.id}/edit`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("You must be logged in to delete tags.");
      }

      // Delete bookmark_tags associations first
      await supabase.from("bookmark_tags").delete().eq("tag_id", tag.id);

      // Then delete the tag
      const { error } = await supabase
        .from("tags")
        .delete()
        .eq("id", tag.id)
        .eq("user_id", session.session.user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Tag deleted",
        description: `${tag.name} has been deleted successfully.`,
      });

      setShowDeleteDialog(false);
      if (onTagUpdate) {
        onTagUpdate();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete tag",
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
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the tag &ldquo;{tag.name}&rdquo;?
              This action cannot be undone.
              {tag.bookmark_tags?.count > 0 && (
                <span className="block mt-2 text-orange-600">
                  Note: This tag is associated with {tag.bookmark_tags.count}{" "}
                  bookmark(s). Deleting it will remove the tag from all
                  bookmarks.
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
