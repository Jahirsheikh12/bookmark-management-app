import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { tagService } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { Tag } from "@/types/bookmark";
import { TagFormData } from "@/lib/validations";

// Get all tags
export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags(),
    queryFn: async () => {
      const response = await tagService.getTags();
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}

// Create tag mutation
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TagFormData) => {
      const response = await tagService.createTag(data);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: () => {
      // Invalidate and refetch tag queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tags() });

      toast({
        title: "Success",
        description: "Tag created successfully",
      });
    },
  });
}

// Delete tag mutation
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await tagService.deleteTag(id);
      if (!response.success) {
        throw new Error(response.error);
      }
    },
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.tags() });

      // Snapshot the previous value
      const previousTags = queryClient.getQueryData(queryKeys.tags());

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.tags(), (old: Tag[] | undefined) => {
        return old?.filter((tag) => tag.id !== id);
      });

      // Return a context object with the snapshotted value
      return { previousTags };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTags) {
        queryClient.setQueryData(queryKeys.tags(), context.previousTags);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.tags() });
      // Also invalidate bookmarks since tags changed
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks() });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
    },
  });
}
