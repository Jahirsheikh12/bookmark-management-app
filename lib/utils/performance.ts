/**
 * Simple cache implementation for API responses
 */
class Cache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  set<T>(key: string, data: T, ttl: number = 300000): void {
    // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const apiCache = new Cache();

/**
 * Debounce function to limit API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function to limit function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Create a cached version of an async function
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  func: T,
  getCacheKey: (...args: Parameters<T>) => string,
  ttl: number = 300000
): T {
  return ((...args: Parameters<T>) => {
    const cacheKey = getCacheKey(...args);
    const cached = apiCache.get(cacheKey);

    if (cached) {
      return Promise.resolve(cached);
    }

    return func(...args).then((result) => {
      apiCache.set(cacheKey, result, ttl);
      return result;
    });
  }) as T;
}

/**
 * Lazy loading utility for images
 */
export function createIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach(callback);
    },
    {
      rootMargin: "50px 0px",
      threshold: 0.01,
      ...options,
    }
  );
}

/**
 * Batch multiple async operations
 */
export async function batchAsync<T, R>(
  items: T[],
  asyncFn: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(asyncFn));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Retry utility for failed operations
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i === maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }

  throw lastError || new Error("Maximum retries exceeded");
}

/**
 * Memoization utility
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);

    return result;
  }) as T;
}

/**
 * Performance timing utility
 */
export class PerformanceTimer {
  private marks = new Map<string, number>();

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark?: string): number {
    const endTime = performance.now();
    const startTime = startMark
      ? this.marks.get(startMark)
      : this.marks.get(name);

    if (!startTime) {
      throw new Error(`Mark "${startMark || name}" not found`);
    }

    const duration = endTime - startTime;
    console.log(`${name}: ${duration.toFixed(2)}ms`);

    return duration;
  }

  clear(): void {
    this.marks.clear();
  }
}

export const timer = new PerformanceTimer();
