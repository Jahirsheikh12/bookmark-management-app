"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkWithRelations } from "@/types/bookmark";
import { BookmarkCard } from "@/components/shared/bookmark-card";
import { BookmarkRow } from "@/components/shared/bookmark-row";

interface BookmarkListProps {
  bookmarks: BookmarkWithRelations[];
  onBookmarkUpdate?: () => void;
}

export default function BookmarkList({
  bookmarks,
  onBookmarkUpdate,
}: BookmarkListProps) {
  const [view, setView] = useState<"grid" | "list">("grid");

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No bookmarks found.</p>
      </div>
    );
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

      <motion.div
        key={view}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
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
      </motion.div>
    </div>
  );
}
