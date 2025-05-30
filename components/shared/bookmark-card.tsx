"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
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
import { ExternalLink, Folder } from "lucide-react";
import { BookmarkWithRelations } from "@/types/bookmark";
import { BookmarkActions } from "./bookmark-actions";

interface BookmarkCardProps {
  bookmark: BookmarkWithRelations;
  index: number;
  onUpdate?: () => void;
  className?: string;
}

export function BookmarkCard({
  bookmark,
  index,
  onUpdate,
  className,
}: BookmarkCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={className}
    >
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border shadow-sm hover:scale-[1.02]">
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
                  onError={(e) => {
                    // Hide favicon if it fails to load
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
            <CardTitle className="text-base sm:text-lg line-clamp-2 leading-tight">
              <Link
                href={`/dashboard/bookmarks/${bookmark.id}`}
                className="hover:underline focus:underline focus:outline-none"
                tabIndex={0}
              >
                {bookmark.title}
              </Link>
            </CardTitle>
            <CardDescription className="line-clamp-1 mt-1 text-xs sm:text-sm">
              {getHostname(bookmark.url)}
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
              <Badge
                key={tag.tags.id}
                variant="outline"
                className="text-xs"
                style={{ borderColor: tag.tags.color || undefined }}
              >
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
          </div>
        </CardFooter>
      </Card>
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
