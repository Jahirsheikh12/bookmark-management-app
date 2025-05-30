import { z } from "zod";

// Common validation patterns
const urlRegex = /^https?:\/\/.+/;
const hexColorRegex = /^#[0-9A-F]{6}$/i;

// URL validation with security checks
export const urlSchema = z
  .string()
  .min(1, "URL is required")
  .regex(urlRegex, "Must be a valid HTTP/HTTPS URL")
  .refine((url) => {
    try {
      const parsedUrl = new URL(url);
      // Block potentially dangerous protocols
      return ["http:", "https:"].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }, "Invalid URL format");

// Text validation with XSS protection
const sanitizeText = (val: string) => {
  // Basic XSS protection - strip dangerous characters
  return val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
};

export const sanitizedTextSchema = z.string().trim().transform(sanitizeText);

// Enhanced text validation for titles and names
export const titleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(255, "Title must be less than 255 characters")
  .transform(sanitizeText);

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters")
  .transform(sanitizeText);

export const descriptionSchema = z
  .string()
  .trim()
  .max(1000, "Description must be less than 1000 characters")
  .transform(sanitizeText)
  .optional();

export const notesSchema = z
  .string()
  .trim()
  .max(2000, "Notes must be less than 2000 characters")
  .transform(sanitizeText)
  .optional();

// Color validation
export const colorSchema = z
  .string()
  .regex(hexColorRegex, "Please enter a valid hex color code")
  .optional();

// Email validation
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .toLowerCase();

// Password validation with security requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

// Form schemas
export const authFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const bookmarkFormSchema = z.object({
  url: urlSchema,
  title: titleSchema,
  description: descriptionSchema,
  notes: notesSchema,
  folderId: z.string().uuid().optional().or(z.literal("")),
});

export const folderFormSchema = z.object({
  name: nameSchema,
  parentId: z.string().uuid().optional().or(z.literal("")),
});

export const tagFormSchema = z.object({
  name: nameSchema,
  color: colorSchema,
});

export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(255),
  folderId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

// ID validation
export const uuidSchema = z.string().uuid("Invalid ID format");

export type AuthFormData = z.infer<typeof authFormSchema>;
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type BookmarkFormData = z.infer<typeof bookmarkFormSchema>;
export type FolderFormData = z.infer<typeof folderFormSchema>;
export type TagFormData = z.infer<typeof tagFormSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
