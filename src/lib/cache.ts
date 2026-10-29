type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

// Global in-memory cache store
const cacheMap = new Map<string, CacheEntry<any>>();

/**
 * Retrieve cached data if present and not expired
 */
export function getCached<T>(key: string): T | null {
  const entry = cacheMap.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cacheMap.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Store data in cache with TTL in seconds (default: 60s)
 */
export function setCached<T>(key: string, data: T, ttlSeconds = 60): void {
  cacheMap.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Invalidate cache by key or prefix
 */
export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    cacheMap.clear();
    return;
  }
  cacheMap.forEach((_, key) => {
    if (key.startsWith(prefix)) {
      cacheMap.delete(key);
    }
  });
}
