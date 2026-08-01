import Conf from 'conf';

interface Config {
  apiKey: string;
  apiBase: string;
}

const config = new Conf<Config>({
  projectName: 'csc',
  schema: {
    apiKey: { type: 'string', default: '' },
    apiBase: { type: 'string', default: 'https://api.countrystatecity.in/v1' },
  },
});

/** Retrieves the stored API key, or undefined if not set. */
export function getApiKey(): string | undefined {
  return config.get('apiKey') || undefined;
}

/** Persists the user's API key to local config. */
export function setApiKey(key: string): void {
  config.set('apiKey', key);
}

/** Removes the stored API key. */
export function clearApiKey(): void {
  config.delete('apiKey');
}

/** Returns the API base URL. */
export function getApiBase(): string {
  return config.get('apiBase');
}

/** Returns true if an API key is currently stored. */
export function isAuthenticated(): boolean {
  return getApiKey() !== undefined;
}
