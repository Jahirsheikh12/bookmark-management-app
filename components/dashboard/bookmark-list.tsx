"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  ExternalLink,
  Folder,
  MoreHorizontal,
  Tag,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkWithRelations } from "@/types/bookmark";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { toast } from "@/hooks/use-toast";
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

interface BookmarkProps {
  bookmarks: BookmarkWithRelations[];
  onBookmarkUpdate?: () => void;
}

export default function BookmarkList({
  bookmarks,
  onBookmarkUpdate,
}: BookmarkProps) {
  const [view, setView] = useState<"grid" | "list">("grid");

  if (!bookmarks || bookmarks.length === 0) {
    return <div className="text-center py-10">No bookmarks found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Tabs
          defaultValue="grid"
          onValueChange={(value) => setView(value as "grid" | "list")}
        >
          <TabsList className="grid w-[140px] sm:w-[160px] grid-cols-2">
            <TabsTrigger value="grid" className="text-xs sm:text-sm">
              Grid
            </TabsTrigger>
            <TabsTrigger value="list" className="text-xs sm:text-sm">
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {bookmarks.map((bookmark, index) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              index={index}
              onUpdate={onBookmarkUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((bookmark, index) => (
            <BookmarkRow
              key={bookmark.id}
              bookmark={bookmark}
              index={index}
              onUpdate={onBookmarkUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookmarkCard({
  bookmark,
  index,
  onUpdate,
}: {
  bookmark: BookmarkWithRelations;
  index: number;
  onUpdate?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:scale-[1.02]">
        <CardHeader className="p-4 pb-3 flex flex-row justify-between items-start space-y-0">
          <div className="flex-1 min-w-0">
            {bookmark.favicon && (
              <div className="mb-3 h-8 w-8 rounded overflow-hidden bg-white p-1 shadow-sm border">
                <Image
                  src={bookmark.favicon}
                  alt=""
                  width={24}
                  height={24}
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            <CardTitle className="text-base sm:text-lg line-clamp-2 leading-tight">
              <Link
                href={`/dashboard/bookmarks/${bookmark.id}`}
                className="hover:underline"
              >
                {bookmark.title}
              </Link>
            </CardTitle>
            <CardDescription className="line-clamp-1 mt-1 text-xs sm:text-sm">
              {new URL(bookmark.url).hostname}
            </CardDescription>
          </div>
          <div className="ml-2 flex-shrink-0">
            <BookmarkActions bookmark={bookmark} onUpdate={onUpdate} />
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 flex-grow">
          {bookmark.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mb-3">
              {bookmark.description}
            </p>
          )}
          {bookmark.folders && (
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <Folder className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{bookmark.folders.name}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5 w-full">
            {bookmark.bookmark_tags?.slice(0, 3).map((tag) => (
              <Badge key={tag.tags.id} variant="outline" className="text-xs">
                {tag.tags.name}
              </Badge>
            ))}
            {bookmark.bookmark_tags && bookmark.bookmark_tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{bookmark.bookmark_tags.length - 3}
              </Badge>
            )}
          </div>
          <div className="flex justify-end w-full">
            <Button size="sm" variant="ghost" className="h-8 px-3" asChild>
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sr-only">Open</span>
              </a>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

function BookmarkRow({
  bookmark,
  index,
  onUpdate,
}: {
  bookmark: BookmarkWithRelations;
  index: number;
  onUpdate?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
        {bookmark.favicon ? (
          <div className="h-8 w-8 rounded overflow-hidden bg-white p-1 shadow-sm border flex-shrink-0">
            <Image
              src={bookmark.favicon}
              alt=""
              width={24}
              height={24}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
            <ExternalLink className="h-4 w-4 text-primary" />
          </div>
        )}

        <div className="flex-grow min-w-0 space-y-1">
          <h3 className="font-medium line-clamp-1 text-sm sm:text-base">
            <Link
              href={`/dashboard/bookmarks/${bookmark.id}`}
              className="hover:underline"
            >
              {bookmark.title}
            </Link>
          </h3>
          <div className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            {new URL(bookmark.url).hostname}
          </div>
          {bookmark.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 sm:hidden">
              {bookmark.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {bookmark.folders && (
            <div className="hidden lg:flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <Folder className="h-3 w-3" />
              <span className="truncate max-w-[100px]">
                {bookmark.folders.name}
              </span>
            </div>
          )}

          <div className="hidden sm:flex gap-1">
            {bookmark.bookmark_tags?.slice(0, 2).map((tag) => (
              <Badge key={tag.tags.id} variant="outline" className="text-xs">
                {tag.tags.name}
              </Badge>
            ))}
            {bookmark.bookmark_tags && bookmark.bookmark_tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{bookmark.bookmark_tags.length - 2}
              </Badge>
            )}
          </div>

          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
            <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sr-only">Open</span>
            </a>
          </Button>

          <BookmarkActions bookmark={bookmark} onUpdate={onUpdate} />
        </div>
      </div>
    </motion.div>
  );
}

function BookmarkActions({
  bookmark,
  onUpdate,
}: {
  bookmark: BookmarkWithRelations;
  onUpdate?: () => void;
}) {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    router.push(`/dashboard/bookmarks/${bookmark.id}/edit`);
  };

  const handleMove = () => {
    // Navigate to move bookmark page or open move dialog
    router.push(`/dashboard/bookmarks/${bookmark.id}/move`);
  };

  const handleTag = () => {
    // Navigate to tag bookmark page or open tag dialog
    router.push(`/dashboard/bookmarks/${bookmark.id}/tags`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // First delete bookmark_tags relationships
      await supabase
        .from("bookmark_tags")
        .delete()
        .eq("bookmark_id", bookmark.id);

      // Then delete the bookmark
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", bookmark.id);

      if (error) throw error;

      toast({
        title: "Bookmark deleted",
        description: "The bookmark has been successfully deleted.",
      });

      // Refresh the page or call onUpdate callback
      if (onUpdate) {
        onUpdate();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete bookmark",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
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
