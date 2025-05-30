import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { bookmarkService } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { BookmarkWithRelations, Bookmark } from "@/types/bookmark";
import { BookmarkFormData } from "@/lib/validations";

// Get all bookmarks or bookmarks by folder
export function useBookmarks(folderId?: string) {
  return useQuery({
    queryKey: folderId
      ? queryKeys.bookmarksByFolder(folderId)
      : queryKeys.bookmarks(),
    queryFn: async () => {
      const response = await bookmarkService.getBookmarks(folderId);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}

// Get single bookmark
export function useBookmark(id: string) {
  return useQuery({
    queryKey: queryKeys.bookmark(id),
    queryFn: async () => {
      const response = await bookmarkService.getBookmark(id);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!id,
  });
}

// Search bookmarks
export function useSearchBookmarks(query: string) {
  return useQuery({
    queryKey: queryKeys.searchBookmarks(query),
    queryFn: async () => {
      const response = await bookmarkService.searchBookmarks(query);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: query.length >= 2, // Only search if query is at least 2 characters
  });
}

// Create bookmark mutation
export function useCreateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookmarkFormData) => {
      const response = await bookmarkService.createBookmark(data);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (data: Bookmark) => {
      // Invalidate and refetch bookmark queries
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks() });
      if (data.folder_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookmarksByFolder(data.folder_id),
        });
      }

      toast({
        title: "Success",
        description: "Bookmark created successfully",
      });
    },
  });
}

// Update bookmark mutation
export function useUpdateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<BookmarkFormData>;
    }) => {
      const response = await bookmarkService.updateBookmark(id, data);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (data: Bookmark, variables) => {
      // Update the specific bookmark in cache
      queryClient.setQueryData(queryKeys.bookmark(variables.id), data);

      // Invalidate bookmark lists
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks() });
      if (data.folder_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookmarksByFolder(data.folder_id),
        });
      }

      toast({
        title: "Success",
        description: "Bookmark updated successfully",
      });
    },
  });
}

// Delete bookmark mutation
export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await bookmarkService.deleteBookmark(id);
      if (!response.success) {
        throw new Error(response.error);
      }
    },
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bookmarks() });

      // Snapshot the previous value
      const previousBookmarks = queryClient.getQueryData(queryKeys.bookmarks());

      // Optimistically update to the new value
      queryClient.setQueryData(
        queryKeys.bookmarks(),
        (old: BookmarkWithRelations[] | undefined) => {
          return old?.filter((bookmark) => bookmark.id !== id);
        }
      );

      // Remove the specific bookmark from cache
      queryClient.removeQueries({ queryKey: queryKeys.bookmark(id) });

      // Return a context object with the snapshotted value
      return { previousBookmarks };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousBookmarks) {
        queryClient.setQueryData(
          queryKeys.bookmarks(),
          context.previousBookmarks
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks() });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bookmark deleted successfully",
      });
    },
  });
}
