"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Bookmark, Folder, Search as SearchIcon, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchBookmarks } from "@/hooks/use-bookmarks";

interface SearchResult {
  id: string;
  title: string;
  type: "bookmark" | "folder" | "tag";
  url?: string;
  description?: string;
}

export function Search() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Use TanStack Query for search
  const { data: searchResults = [], isLoading } = useSearchBookmarks(query);

  // Transform bookmark results to search results
  const results: SearchResult[] = searchResults.map((bookmark) => ({
    id: bookmark.id,
    title: bookmark.title,
    type: "bookmark" as const,
    url: bookmark.url,
    description: bookmark.description || undefined,
  }));

  // Clear results when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    switch (result.type) {
      case "bookmark":
        router.push(`/dashboard/bookmarks/${result.id}`);
        break;
      case "folder":
        router.push(`/dashboard/folders/${result.id}`);
        break;
      case "tag":
        router.push(`/dashboard/tags/${result.id}`);
        break;
    }
  };

  const handleQuickAccess = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full max-w-9 p-0 sm:h-10 sm:max-w-none sm:w-52 md:w-60 lg:w-72 sm:justify-start sm:px-3 sm:py-2"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline-flex text-sm truncate">
          Search bookmarks...
        </span>
        <span className="sr-only sm:not-sr-only">Search</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search bookmarks, folders, tags..."
          className="h-12"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[400px] p-2">
          <CommandEmpty className="py-6 text-center text-sm">
            {isLoading
              ? "Searching..."
              : query.length < 2
              ? "Type at least 2 characters to search"
              : "No results found."}
          </CommandEmpty>

          {!query && (
            <CommandGroup heading="Quick Access">
              <CommandItem
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
                onSelect={() => handleQuickAccess("/dashboard/bookmarks")}
              >
                <Bookmark className="mr-2 h-4 w-4 text-blue-500" />
                <span>All Bookmarks</span>
              </CommandItem>
              <CommandItem
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
                onSelect={() => handleQuickAccess("/dashboard/folders")}
              >
                <Folder className="mr-2 h-4 w-4 text-yellow-500" />
                <span>Browse Folders</span>
              </CommandItem>
              <CommandItem
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
                onSelect={() => handleQuickAccess("/dashboard/tags")}
              >
                <Tag className="mr-2 h-4 w-4 text-green-500" />
                <span>Browse Tags</span>
              </CommandItem>
            </CommandGroup>
          )}

          {results.length > 0 && (
            <CommandGroup heading="Bookmarks">
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
                  onSelect={() => handleSelect(result)}
                >
                  <Bookmark className="mr-2 h-4 w-4 text-blue-500" />
                  <div className="flex flex-col items-start">
                    <span>{result.title}</span>
                    {result.url && (
                      <span className="text-xs text-muted-foreground">
                        {getHostname(result.url)}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
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
