import { QueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

// Default options for all queries
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  retry: (failureCount: number, error: any) => {
    // Don't retry on 4xx errors (client errors)
    if (error?.status >= 400 && error?.status < 500) {
      return false;
    }
    // Retry up to 3 times for other errors
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * 2 ** attemptIndex, 30000);
  },
};

// Default options for mutations
const defaultMutationOptions = {
  onError: (error: any) => {
    // Global error handling for mutations
    const message = error?.message || "An unexpected error occurred";
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: defaultQueryOptions,
    mutations: defaultMutationOptions,
  },
});

// Query keys factory for consistent cache key management
export const queryKeys = {
  all: ["bookmarks"] as const,
  bookmarks: () => [...queryKeys.all, "list"] as const,
  bookmark: (id: string) => [...queryKeys.all, "detail", id] as const,
  bookmarksByFolder: (folderId: string) =>
    [...queryKeys.all, "folder", folderId] as const,
  searchBookmarks: (query: string) =>
    [...queryKeys.all, "search", query] as const,

  folders: () => ["folders"] as const,
  folder: (id: string) => [...queryKeys.folders(), id] as const,

  tags: () => ["tags"] as const,
  tag: (id: string) => [...queryKeys.tags(), id] as const,

  auth: () => ["auth"] as const,
  user: () => [...queryKeys.auth(), "user"] as const,
} as const;
