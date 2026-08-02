import { chmodSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

interface Config {
  apiKey?: string;
  apiBase?: string;
}

const defaultBase = 'https://api.countrystatecity.in/v1';

const configDir = (): string => {
  const override = process.env['CSC_CONFIG_DIR'];
  if (override) return resolve(override);
  if (process.platform === 'darwin') return join(homedir(), 'Library', 'Preferences', 'csc-nodejs');
  if (process.platform === 'win32') {
    const appData = process.env['APPDATA'] ?? join(homedir(), 'AppData', 'Roaming');
    return join(appData, 'csc-nodejs', 'Config');
  }
  const base = process.env['XDG_CONFIG_HOME'] ?? join(homedir(), '.config');
  return join(base, 'csc-nodejs');
};

const configFile = (): string => join(configDir(), 'config.json');

const read = (): Config => {
  try {
    const parsed = JSON.parse(readFileSync(configFile(), 'utf8')) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const value = parsed as Record<string, unknown>;
    const config: Config = {};
    if (typeof value['apiKey'] === 'string') config.apiKey = value['apiKey'];
    if (typeof value['apiBase'] === 'string') config.apiBase = value['apiBase'];
    return config;
  } catch {
    return {};
  }
};

const write = (config: Config): void => {
  const dir = configDir();
  const file = configFile();
  const temp = `${file}.${process.pid}.tmp`;
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  writeFileSync(temp, `${JSON.stringify(config, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  rmSync(file, { force: true });
  renameSync(temp, file);
  if (process.platform !== 'win32') chmodSync(file, 0o600);
};

/** Retrieves the stored API key, or undefined if not set. */
export const getApiKey = (): string | undefined => read().apiKey || undefined;

/** Persists the user's API key to local config. */
export const setApiKey = (key: string): void => {
  const current = read();
  write({ ...current, apiKey: key });
};

/** Removes the stored API key. */
export const clearApiKey = (): void => {
  const current = read();
  delete current.apiKey;
  write(current);
};

/** Returns the API base URL. */
export const getApiBase = (): string => read().apiBase || defaultBase;

/** Returns true if an API key is currently stored. */
export const isAuthenticated = (): boolean => getApiKey() !== undefined;
