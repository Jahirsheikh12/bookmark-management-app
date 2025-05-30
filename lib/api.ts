import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import {
  BookmarkWithRelations,
  Bookmark,
  BookmarkInsert,
  BookmarkUpdate,
  Folder,
  FolderInsert,
  FolderUpdate,
  Tag,
  TagInsert,
  TagUpdate,
  Profile,
} from "@/types/bookmark";
import {
  bookmarkFormSchema,
  folderFormSchema,
  tagFormSchema,
  uuidSchema,
  FolderFormData,
  TagFormData,
} from "./validations";

// API Response wrapper
interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Error handling wrapper
const handleApiError = (error: any): string => {
  if (error.message) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
};

// Create API instance with error handling
const createApiClient = () => {
  return createClientComponentClient<Database>();
};

// Authentication service
export class AuthService {
  private supabase = createApiClient();

  async getCurrentUser() {
    try {
      const {
        data: { session },
        error,
      } = await this.supabase.auth.getSession();
      if (error) throw error;
      return { data: session?.user || null, success: true };
    } catch (error) {
      return { error: handleApiError(error), success: false };
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { error: handleApiError(error), success: false };
    }
  }
}

// Bookmark service with validation and security
export class BookmarkService {
  private supabase = createApiClient();

  async getBookmarks(
    folderId?: string
  ): Promise<ApiResponse<BookmarkWithRelations[]>> {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");

      let query = this.supabase
        .from("bookmarks")
        .select(
          `
          *,
          folders (id, name),
          bookmark_tags (
            tags (id, name, color)
          )
        `
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (folderId) {
        // Validate folder ID format
        const validatedId = uuidSchema.parse(folderId);
        query = query.eq("folder_id", validatedId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: data || [], success: true };
    } catch (error) {
      return { error: handleApiError(error), success: false };
    }
  }

  async getBookmark(id: string): Promise<ApiResponse<BookmarkWithRelations>> {
    try {
      const validatedId = uuidSchema.parse(id);
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");

      const { data, error } = await this.supabase
        .from("bookmarks")
        .select(
          `
          *,
          folders (id, name),
          bookmark_tags (
            tags (id, name, color)
          )
        `
        )
        .eq("id", validatedId)
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Bookmark not found");

      return { data, success: true };
    } catch (error) {
      return { error: handleApiError(error), success: false };
    }
  }

  async createBookmark(
    bookmarkData: Omit<BookmarkInsert, "user_id" | "folder_id"> & {
      folderId?: string | null;
    }
  ): Promise<ApiResponse<Bookmark>> {
    try {
      // Validate input data
      const validatedData = bookmarkFormSchema.parse(bookmarkData);
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");

      const insertData: BookmarkInsert = {
        ...validatedData,
        user_id: session.user.id,
        folder_id: validatedData.folderId || null,
      };

      const { data, error } = await this.supabase
        .from("bookmarks")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error) {
      return { error: handleApiError(error), success: false };
    }
  }

  async updateBookmark(
    id: string,
    bookmarkData: Partial<BookmarkUpdate>
  ): Promise<ApiResponse<Bookmark>> {
    try {
      const validatedId = uuidSchema.parse(id);
      const validatedData = bookmarkFormSchema.partial().parse(bookmarkData);
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");

      const { data, error } = await this.supabase
        .from("bookmarks")
        .update({
          ...validatedData,
          folder_id: validatedData.folderId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", validatedId)
        .eq("user_id", session.user.id)
        .select()
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error) {
      return { error: handleApiError(error), success: false };
    }
  }

  async deleteBookmark(id: string): Promise<ApiResponse<void>> {
    try {
      const validatedId = uuidSchema.parse(id);
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");

      // Delete bookmark tags first
      await this.supabase
        .from("bookmark_tags")
        .delete()
        .eq("bookmark_id", validatedId);

      // Delete bookmark
      const { error } = await this.supabase
        .from("bookmarks")
        .delete()
        .eq("id", validatedId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { error: handleApiError(error), success: false };
    }
  }

  async searchBookmarks(
    query: string
  ): Promise<ApiResponse<BookmarkWithRelations[]>> {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");

      const { data, error } = await this.supabase
        .from("bookmarks")
        .select(
          `
          *,
          folders (id, name),
          bookmark_tags (
            tags (id, name, color)
          )
        `
        )
        .eq("user_id", session.user.id)
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%,url.ilike.%${query}%`
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      return { data: data || [], success: true };
    } catch (error) {
      return { error: handleApiError(error), success: false };
    }
  }
}

// Folder service
export class FolderService {
  private supabase = createApiClient();

  async getFolders(): Promise<ApiResponse<Folder[]>> {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");

      const { data, error } = await this.supabase
        .from("folders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("name");

      if (error) throw error;

      return { data: data || [], success: true };
    } catch (error) {
      return { error: handleApiError(error), success: false };
    }
  }

  async createFolder(folderData: FolderFormData): Promise<ApiResponse<Folder>> {
    try {
      const validatedData = folderFormSchema.parse(folderData);
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");

      const insertData: FolderInsert = {
        name: validatedData.name,
        user_id: session.user.id,
        parent_id: validatedData.parentId || null,
      };

      const { data, error } = await this.supabase
        .from("folders")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error) {
      return { error: handleApiError(error), success: false };
    }
  }

  async deleteFolder(id: string): Promise<ApiResponse<void>> {
    try {
      const validatedId = uuidSchema.parse(id);
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");

      const { error } = await this.supabase
        .from("folders")
        .delete()
        .eq("id", validatedId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { error: handleApiError(error), success: false };
    }
  }
}

// Tag service
export class TagService {
  private supabase = createApiClient();

  async getTags(): Promise<ApiResponse<Tag[]>> {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");

      const { data, error } = await this.supabase
        .from("tags")
        .select("*")
        .eq("user_id", session.user.id)
        .order("name");

      if (error) throw error;

      return { data: data || [], success: true };
    } catch (error) {
      return { error: handleApiError(error), success: false };
    }
  }

  async createTag(tagData: TagFormData): Promise<ApiResponse<Tag>> {
    try {
      const validatedData = tagFormSchema.parse(tagData);
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");

      const insertData: TagInsert = {
        name: validatedData.name,
        color: validatedData.color || null,
        user_id: session.user.id,
      };

      const { data, error } = await this.supabase
        .from("tags")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error) {
      return { error: handleApiError(error), success: false };
    }
  }

  async deleteTag(id: string): Promise<ApiResponse<void>> {
    try {
      const validatedId = uuidSchema.parse(id);
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");

      // Delete bookmark_tags relationships first
      await this.supabase
        .from("bookmark_tags")
        .delete()
        .eq("tag_id", validatedId);

      // Delete tag
      const { error } = await this.supabase
        .from("tags")
        .delete()
        .eq("id", validatedId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { error: handleApiError(error), success: false };
    }
  }
}

// Export service instances
export const authService = new AuthService();
export const bookmarkService = new BookmarkService();
export const folderService = new FolderService();
export const tagService = new TagService();
