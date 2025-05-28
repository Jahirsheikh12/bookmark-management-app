import { Database } from "./supabase";

// Extract types from Supabase database schema
export type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];
export type BookmarkInsert =
  Database["public"]["Tables"]["bookmarks"]["Insert"];
export type BookmarkUpdate =
  Database["public"]["Tables"]["bookmarks"]["Update"];

export type Folder = Database["public"]["Tables"]["folders"]["Row"];
export type FolderInsert = Database["public"]["Tables"]["folders"]["Insert"];
export type FolderUpdate = Database["public"]["Tables"]["folders"]["Update"];

export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];
export type TagUpdate = Database["public"]["Tables"]["tags"]["Update"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// Extended types with relations
export type BookmarkWithRelations = Bookmark & {
  folders?: Folder | null;
  bookmark_tags?: {
    tags: Tag;
  }[];
};

export type FolderWithBookmarks = Folder & {
  bookmarks?: Bookmark[];
};
