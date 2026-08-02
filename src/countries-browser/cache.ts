/**
 * LRU (Least Recently Used) cache for @countrystatecity/countries-browser
 * Uses Map iteration order (insertion order) for O(1) eviction
 */

export class LRUCache<K, V> {
  readonly #map = new Map<K, V>();
  readonly #max: number;

  /**
   * Create a new LRU cache with the given maximum number of entries.
   * @param maxSize Maximum number of entries before oldest is evicted
   */
  constructor(maxSize: number) {
    this.#max = maxSize;
  }

  /**
   * Get a value from cache, marking it as most recently used.
   * Returns undefined on cache miss.
   */
  get(key: K): V | undefined {
    const value = this.#map.get(key);
    if (value === undefined) return undefined;
    this.#map.delete(key);
    this.#map.set(key, value);
    return value;
  }

  /**
   * Store a value in cache, evicting the oldest entry if at capacity.
   * If the key already exists, its value is updated and it becomes most recent.
   */
  set(key: K, value: V): void {
    this.#map.delete(key);
    this.#map.set(key, value);
    if (this.#map.size <= this.#max) return;
    const oldest = this.#map.keys().next();
    if (!oldest.done) this.#map.delete(oldest.value);
  }

  /**
   * Remove all entries from cache.
   */
  clear(): void {
    this.#map.clear();
  }
}
