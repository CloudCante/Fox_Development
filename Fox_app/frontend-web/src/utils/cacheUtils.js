/**
 * Simple cache implementation for storing fetch responses
 */
export class SimpleCache {
  constructor(ttl = 60000) {
    this.cache = new Map();
    this.ttl = ttl; // default 1 minute TTL (time-to-live)
  }

  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found/expired
   */
  get(key) {
    if (!this.cache.has(key)) return null;
    
    const item = this.cache.get(key);
    const now = Date.now();
    
    if (now > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number|null} customTtl - Optional custom TTL
   */
  set(key, value, customTtl = null) {
    const expiry = Date.now() + (customTtl || this.ttl);
    this.cache.set(key, { value, expiry });
  }

  /**
   * Clear the entire cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Remove a specific key from the cache
   * @param {string} key - Cache key to remove
   */
  delete(key) {
    this.cache.delete(key);
  }
}

// Create a shared instance for data caching
export const dataCache = new SimpleCache(); 