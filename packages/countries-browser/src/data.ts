import { LRUCache } from './cache.ts';
import { getConfig } from './config.ts';
import { fetchJSON } from './fetcher.ts';

let cache: LRUCache<string, unknown> | undefined;

const store = (): LRUCache<string, unknown> => {
  cache ??= new LRUCache<string, unknown>(getConfig().cacheSize);
  return cache;
};

export const clear = (): void => {
  cache = undefined;
};

export const load = async <T>(key: string): Promise<T> => {
  const data = store();
  const saved = data.get(key);
  if (saved !== undefined) return saved as T;
  const value = await fetchJSON<T>(`/data/${key}`);
  data.set(key, value);
  return value;
};
