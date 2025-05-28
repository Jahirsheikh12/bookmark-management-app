export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          url: string;
          title: string;
          description: string | null;
          favicon: string | null;
          folder_id: string | null;
          user_id: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          url: string;
          title: string;
          description?: string | null;
          favicon?: string | null;
          folder_id?: string | null;
          user_id: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          url?: string;
          title?: string;
          description?: string | null;
          favicon?: string | null;
          folder_id?: string | null;
          user_id?: string;
          notes?: string | null;
        };
      };
      bookmark_tags: {
        Row: {
          bookmark_id: string;
          tag_id: string;
        };
        Insert: {
          bookmark_id: string;
          tag_id: string;
        };
        Update: {
          bookmark_id?: string;
          tag_id?: string;
        };
      };
      folders: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          user_id: string;
          parent_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          user_id: string;
          parent_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          user_id?: string;
          parent_id?: string | null;
        };
      };
      tags: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          user_id: string;
          color: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          user_id: string;
          color?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          user_id?: string;
          color?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
