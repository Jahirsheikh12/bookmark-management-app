interface BookmarkMetadata {
  title?: string;
  description?: string;
  favicon?: string;
}

/**
 * Fetches metadata for a given URL
 */
export async function fetchBookmarkMetadata(
  url: string
): Promise<BookmarkMetadata> {
  try {
    // Validate URL
    const urlObj = new URL(url);

    // For client-side execution, we'll use a simple approach
    // In a production app, you'd want to use a server-side API or service

    // Try to get favicon
    const favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;

    // For title, we'll try to fetch the page if CORS allows
    let title = urlObj.hostname;
    let description: string | undefined;

    try {
      // This will only work if the target site allows CORS
      // In production, you'd typically use a server-side proxy
      const response = await fetch(url, {
        mode: "cors",
        headers: {
          "User-Agent": "Bookmark Manager Bot",
        },
      });

      if (response.ok) {
        const html = await response.text();

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          title = titleMatch[1].trim();
        }

        // Extract description from meta tags
        const descriptionMatch = html.match(
          /<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i
        );
        if (descriptionMatch) {
          description = descriptionMatch[1].trim();
        }
      }
    } catch (corsError) {
      // CORS error is expected for most sites
      // Fallback to basic title
      console.log("CORS prevented metadata fetch, using hostname as title");
    }

    return {
      title,
      description,
      favicon,
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);

    // Fallback metadata
    try {
      const urlObj = new URL(url);
      return {
        title: urlObj.hostname,
        favicon: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`,
      };
    } catch {
      return {
        title: url,
      };
    }
  }
}

/**
 * Extracts hostname from URL for display purposes
 */
export function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensures URL has a protocol (defaults to https)
 */
export function normalizeUrl(url: string): string {
  if (!url) return url;

  // If no protocol specified, default to https
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }

  return url;
}
