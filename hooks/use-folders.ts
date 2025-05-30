import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { folderService } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { Folder } from "@/types/bookmark";
import { FolderFormData } from "@/lib/validations";

// Get all folders
export function useFolders() {
  return useQuery({
    queryKey: queryKeys.folders(),
    queryFn: async () => {
      const response = await folderService.getFolders();
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}

// Create folder mutation
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FolderFormData) => {
      const response = await folderService.createFolder(data);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: () => {
      // Invalidate and refetch folder queries
      queryClient.invalidateQueries({ queryKey: queryKeys.folders() });

      toast({
        title: "Success",
        description: "Folder created successfully",
      });
    },
  });
}

// Delete folder mutation
export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await folderService.deleteFolder(id);
      if (!response.success) {
        throw new Error(response.error);
      }
    },
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.folders() });

      // Snapshot the previous value
      const previousFolders = queryClient.getQueryData(queryKeys.folders());

      // Optimistically update to the new value
      queryClient.setQueryData(
        queryKeys.folders(),
        (old: Folder[] | undefined) => {
          return old?.filter((folder) => folder.id !== id);
        }
      );

      // Return a context object with the snapshotted value
      return { previousFolders };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFolders) {
        queryClient.setQueryData(queryKeys.folders(), context.previousFolders);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.folders() });
      // Also invalidate bookmarks since folder structure changed
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks() });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
    },
  });
}
