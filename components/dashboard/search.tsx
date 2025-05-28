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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

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
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

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

  useEffect(() => {
    const searchData = async () => {
      if (!query.trim() || query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;

        const searchTerm = `%${query}%`;

        // Search bookmarks
        const { data: bookmarks } = await supabase
          .from("bookmarks")
          .select("id, title, url, description")
          .or(
            `title.ilike.${searchTerm},description.ilike.${searchTerm},url.ilike.${searchTerm}`
          )
          .eq("user_id", session.session.user.id)
          .limit(10);

        // Search folders
        const { data: folders } = await supabase
          .from("folders")
          .select("id, name")
          .ilike("name", searchTerm)
          .eq("user_id", session.session.user.id)
          .limit(5);

        // Search tags
        const { data: tags } = await supabase
          .from("tags")
          .select("id, name")
          .ilike("name", searchTerm)
          .eq("user_id", session.session.user.id)
          .limit(5);

        const searchResults: SearchResult[] = [
          ...(bookmarks || []).map((bookmark) => ({
            id: bookmark.id,
            title: bookmark.title,
            type: "bookmark" as const,
            url: bookmark.url,
            description: bookmark.description || undefined,
          })),
          ...(folders || []).map((folder) => ({
            id: folder.id,
            title: folder.name,
            type: "folder" as const,
          })),
          ...(tags || []).map((tag) => ({
            id: tag.id,
            title: tag.name,
            type: "tag" as const,
          })),
        ];

        setResults(searchResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, supabase]);

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
                onSelect={() => {
                  setOpen(false);
                  router.push("/dashboard/bookmarks");
                }}
              >
                <Bookmark className="mr-2 h-4 w-4 text-blue-500" />
                <span>All Bookmarks</span>
              </CommandItem>
              <CommandItem
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
                onSelect={() => {
                  setOpen(false);
                  router.push("/dashboard/folders");
                }}
              >
                <Folder className="mr-2 h-4 w-4 text-yellow-500" />
                <span>Browse Folders</span>
              </CommandItem>
              <CommandItem
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
                onSelect={() => {
                  setOpen(false);
                  router.push("/dashboard/tags");
                }}
              >
                <Tag className="mr-2 h-4 w-4 text-green-500" />
                <span>Browse Tags</span>
              </CommandItem>
            </CommandGroup>
          )}

          {results.length > 0 && (
            <>
              {results.filter((r) => r.type === "bookmark").length > 0 && (
                <CommandGroup heading="Bookmarks">
                  {results
                    .filter((r) => r.type === "bookmark")
                    .map((result) => (
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
                              {new URL(result.url).hostname}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}

              {results.filter((r) => r.type === "folder").length > 0 && (
                <CommandGroup heading="Folders">
                  {results
                    .filter((r) => r.type === "folder")
                    .map((result) => (
                      <CommandItem
                        key={result.id}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
                        onSelect={() => handleSelect(result)}
                      >
                        <Folder className="mr-2 h-4 w-4 text-yellow-500" />
                        <span>{result.title}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}

              {results.filter((r) => r.type === "tag").length > 0 && (
                <CommandGroup heading="Tags">
                  {results
                    .filter((r) => r.type === "tag")
                    .map((result) => (
                      <CommandItem
                        key={result.id}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
                        onSelect={() => handleSelect(result)}
                      >
                        <Tag className="mr-2 h-4 w-4 text-green-500" />
                        <span>{result.title}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
