/**
 * Sanitize HTML content to prevent XSS attacks (basic implementation)
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "") // Remove object tags
    .replace(/<embed\b[^<]*>/gi, "") // Remove embed tags
    .replace(/javascript:/gi, "") // Remove javascript: URLs
    .replace(/vbscript:/gi, "") // Remove vbscript: URLs
    .replace(/on\w+\s*=/gi, ""); // Remove event handlers
}

/**
 * Sanitize text content by removing dangerous characters
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/javascript:/gi, "") // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize URL
 */
export function validateUrl(url: string): {
  isValid: boolean;
  sanitizedUrl?: string;
  error?: string;
} {
  try {
    const trimmedUrl = url.trim();

    // Check if URL starts with allowed protocols
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      return {
        isValid: false,
        error: "URL must start with http:// or https://",
      };
    }

    const parsedUrl = new URL(trimmedUrl);

    // Block dangerous protocols
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return {
        isValid: false,
        error: "Only HTTP and HTTPS protocols are allowed",
      };
    }

    // Block localhost and private IPs in production
    if (process.env.NODE_ENV === "production") {
      const hostname = parsedUrl.hostname.toLowerCase();
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname.startsWith("172.")
      ) {
        return {
          isValid: false,
          error: "Private and localhost URLs are not allowed",
        };
      }
    }

    return { isValid: true, sanitizedUrl: parsedUrl.toString() };
  } catch (error) {
    return { isValid: false, error: "Invalid URL format" };
  }
}

/**
 * Extract safe hostname from URL
 */
export function extractHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "Invalid URL";
  }
}

/**
 * Rate limiting utility (simple in-memory implementation)
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Filter out requests outside the time window
    const validRequests = userRequests.filter(
      (time) => now - time < this.windowMs
    );

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return true;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  if (typeof window !== "undefined") {
    // Client-side implementation
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  } else {
    // Server-side implementation
    const crypto = require("crypto");
    return crypto.randomBytes(32).toString("hex");
  }
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, expected: string): boolean {
  if (!token || !expected) return false;
  return token === expected;
}

/**
 * Escape user input for display
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}
