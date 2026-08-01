/**
 * Fetch wrapper for @countrystatecity/countries-browser
 */

import { getConfig } from './config.ts';
import { NetworkError, TimeoutError } from './errors.ts';

/**
 * Fetch a JSON resource from the configured CDN
 * @param path - Path relative to baseURL (e.g., '/data/countries.json')
 * @returns Parsed JSON data
 * @throws NetworkError on non-2xx response
 */
export async function fetchJSON<T>(path: string): Promise<T> {
  const cfg = getConfig();
  const url = `${cfg.baseURL}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(cfg.timeout),
      headers: { Accept: 'application/json', ...cfg.headers },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new TimeoutError(`Request timed out after ${cfg.timeout}ms: ${path}`, cfg.timeout);
    }
    throw err;
  }
  if (!res.ok) throw new NetworkError(`Failed to load ${path}: ${res.statusText}`, url, res.status);
  return res.json() as Promise<T>;
}
