/**
 * Configuration management for @countrystatecity/countries-browser
 */

import type { ConfigOptions } from './types.ts';

declare const __VERSION__: string;

interface ResolvedConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  cacheSize: number;
}

const defaults: ResolvedConfig = {
  baseURL: `https://cdn.jsdelivr.net/npm/@countrystatecity/countries-browser@${__VERSION__}/dist`,
  timeout: 5000,
  headers: {},
  cacheSize: 50,
};

let config: ResolvedConfig = { ...defaults };

/**
 * Get the current resolved configuration
 */
export function getConfig(): ResolvedConfig {
  return config;
}

/**
 * Override default configuration options
 * @param options - Partial configuration to merge with defaults
 */
export function configure(options: ConfigOptions): void {
  Object.assign(config, options);
}

/**
 * Reset configuration to defaults
 */
export function resetConfiguration(): void {
  config = { ...defaults };
}
