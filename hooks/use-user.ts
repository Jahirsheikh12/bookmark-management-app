import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

const supabase = createClientComponentClient<Database>();

// Query keys for user-related data
export const userQueryKeys = {
  user: () => ["user"] as const,
  profile: (userId: string) => ["user", "profile", userId] as const,
  preferences: (userId: string) => ["user", "preferences", userId] as const,
};

// Get current user profile
export function useUserProfile() {
  return useQuery({
    queryKey: userQueryKeys.user(),
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return { user, profile };
    },
  });
}

// Get user preferences
export function useUserPreferences() {
  return useQuery({
    queryKey: userQueryKeys.preferences("current"),
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let { data: preferences, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // If no preferences exist, create default ones
      if (error && error.code === "PGRST116") {
        const { data: newPreferences, error: createError } = await supabase
          .from("user_preferences")
          .insert({
            user_id: user.id,
            auto_fetch_metadata: true,
            email_notifications: false,
          })
          .select()
          .single();

        if (createError) throw createError;
        preferences = newPreferences;
      } else if (error) {
        throw error;
      }

      return preferences;
    },
  });
}

// Update user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ full_name }: { full_name: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .update({ full_name })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.user() });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to update profile",
      });
    },
  });
}

// Update user preferences
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: {
      auto_fetch_metadata?: boolean;
      email_notifications?: boolean;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.preferences("current"),
      });
      toast({
        title: "Success",
        description: "Preferences updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to update preferences",
      });
    },
  });
}

// Delete user account
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Delete all user data (cascade delete will handle related records)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Sign out the user
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
    },
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
      });
      // Redirect will be handled by the component
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to delete account",
      });
    },
  });
}

// Import bookmarks
export function useImportBookmarks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const text = await file.text();
      let bookmarks: any[] = [];

      if (file.type === "application/json" || file.name.endsWith(".json")) {
        // Handle JSON import
        const data = JSON.parse(text);

        // Check if it's our export format
        if (data.bookmarks && Array.isArray(data.bookmarks)) {
          bookmarks = data.bookmarks;
        } else if (Array.isArray(data)) {
          bookmarks = data;
        } else {
          throw new Error("Invalid JSON format");
        }
      } else if (file.name.endsWith(".html")) {
        // Handle HTML bookmark export (basic implementation)
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");
        const links = doc.querySelectorAll("a[href]");

        bookmarks = Array.from(links).map((link) => ({
          url: link.getAttribute("href"),
          title: link.textContent || link.getAttribute("href"),
          description: null,
          favicon: null,
          folder_id: null,
          notes: null,
        }));
      } else {
        throw new Error("Unsupported file format");
      }

      // Process bookmarks and handle tags
      const bookmarksToInsert = bookmarks.map((bookmark) => {
        // Extract only the fields that belong to the bookmarks table
        const {
          id,
          bookmark_tags,
          tags,
          folders,
          created_at,
          updated_at,
          ...bookmarkData
        } = bookmark;

        return {
          ...bookmarkData,
          user_id: user.id,
          // Let the database generate new IDs
        };
      });

      // Insert bookmarks first
      const { data: insertedBookmarks, error } = await supabase
        .from("bookmarks")
        .insert(bookmarksToInsert)
        .select();

      if (error) throw error;

      // Handle tags for each bookmark
      for (let i = 0; i < bookmarks.length; i++) {
        const originalBookmark = bookmarks[i];
        const insertedBookmark = insertedBookmarks[i];

        // Check if this bookmark has tags
        const bookmarkTags = originalBookmark.tags || [];

        if (bookmarkTags.length > 0) {
          // Create or get existing tags
          for (const tag of bookmarkTags) {
            if (tag && tag.name) {
              // Try to find existing tag first
              let { data: existingTag } = await supabase
                .from("tags")
                .select("id")
                .eq("name", tag.name)
                .eq("user_id", user.id)
                .single();

              let tagId;

              if (!existingTag) {
                // Create new tag
                const { data: newTag, error: tagError } = await supabase
                  .from("tags")
                  .insert({
                    name: tag.name,
                    color: tag.color || null,
                    user_id: user.id,
                  })
                  .select("id")
                  .single();

                if (tagError) continue; // Skip this tag if creation fails
                tagId = newTag.id;
              } else {
                tagId = existingTag.id;
              }

              // Create bookmark-tag relationship
              await supabase
                .from("bookmark_tags")
                .insert({
                  bookmark_id: insertedBookmark.id,
                  tag_id: tagId,
                })
                .select();
            }
          }
        }
      }

      return insertedBookmarks;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast({
        title: "Import successful",
        description: `Imported ${data.length} bookmarks successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Import failed",
        description: error?.message || "Failed to import bookmarks",
      });
    },
  });
}
