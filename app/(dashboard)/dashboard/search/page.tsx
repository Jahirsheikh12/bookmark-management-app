"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";
import BookmarkList from "@/components/dashboard/bookmark-list";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { BookmarkWithRelations } from "@/types/bookmark";

export default function SearchPage() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookmarkWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("You must be logged in to search.");
      }

      const searchTerm = `%${searchQuery}%`;

      const { data: bookmarks, error } = await supabase
        .from("bookmarks")
        .select(
          `
          *,
          folders:folder_id(id, name),
          bookmark_tags(
            tags(id, name, color)
          )
        `
        )
        .eq("user_id", session.session.user.id)
        .or(
          `title.ilike.${searchTerm},description.ilike.${searchTerm},url.ilike.${searchTerm},notes.ilike.${searchTerm}`
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResults(bookmarks || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, supabase]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    await performSearch(query);
  }

  const handleBookmarkUpdate = () => {
    // Refresh search results when a bookmark is updated
    if (query.trim()) {
      performSearch(query);
    }
  };

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div className="w-full flex items-center justify-center flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Search Bookmarks
          </h1>
          <p className="text-muted-foreground">
            Search through your bookmarks by title, URL, description, or notes
          </p>

          <form
            onSubmit={handleSearch}
            className="flex w-full items-center justify-center mt-4 gap-2"
          >
            <Input
              type="search"
              placeholder="Search bookmarks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-xl"
            />
            <Button type="submit" disabled={isLoading}>
              <SearchIcon className="mr-2 h-4 w-4" />
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </form>
        </div>

        {isLoading && query.length >= 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Searching...</h2>
            <BookmarkList
              bookmarks={[]}
              isLoading={true}
              onBookmarkUpdate={handleBookmarkUpdate}
            />
          </div>
        )}

        {results.length > 0 && !isLoading && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              Search Results ({results.length} found)
            </h2>
            <BookmarkList
              bookmarks={results}
              onBookmarkUpdate={handleBookmarkUpdate}
            />
          </div>
        )}

        {query && query.length >= 2 && results.length === 0 && !isLoading && (
          <div className="text-center py-10 text-muted-foreground">
            No bookmarks found matching &ldquo;{query}&rdquo;.
          </div>
        )}

        {query && query.length < 2 && (
          <div className="text-center py-10 text-muted-foreground">
            Type at least 2 characters to search.
          </div>
        )}

        {!query && (
          <div className="text-center py-10 text-muted-foreground">
            Start typing to search through your bookmarks.
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
