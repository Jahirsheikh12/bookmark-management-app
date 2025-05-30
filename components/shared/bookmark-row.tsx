"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Folder } from "lucide-react";
import { BookmarkWithRelations } from "@/types/bookmark";
import { BookmarkActions } from "./bookmark-actions";

interface BookmarkRowProps {
  bookmark: BookmarkWithRelations;
  index: number;
  onUpdate?: () => void;
  className?: string;
}

export function BookmarkRow({
  bookmark,
  index,
  onUpdate,
  className,
}: BookmarkRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={className}
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
              onError={(e) => {
                // Hide favicon if it fails to load
                e.currentTarget.style.display = "none";
              }}
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
              className="hover:underline focus:underline focus:outline-none"
              tabIndex={0}
            >
              {bookmark.title}
            </Link>
          </h3>
          <div className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            {getHostname(bookmark.url)}
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
              <Badge
                key={tag.tags.id}
                variant="outline"
                className="text-xs"
                style={{ borderColor: tag.tags.color || undefined }}
              >
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
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${bookmark.title} in new tab`}
            >
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

// Helper function to safely extract hostname
function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
