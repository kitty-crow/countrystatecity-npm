import chalk from './ansi.ts';
import { getApiBase, getApiKey } from './config.ts';
import { USER_AGENT } from '../version.ts';

export interface UsageInfo {
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
}

interface ApiResponse<T> {
  data: T;
  usage: UsageInfo | null;
}

class HttpError extends Error {
  constructor(readonly status: number, statusText: string) {
    super(statusText ? `HTTP ${status}: ${statusText}` : `HTTP ${status}`);
  }
}

const extractUsage = (headers: Headers): UsageInfo | null => {
  const dailyUsed = headers.get('x-csc-daily-used');
  const dailyLimit = headers.get('x-csc-daily-limit');
  const monthlyUsed = headers.get('x-csc-monthly-used');
  const monthlyLimit = headers.get('x-csc-monthly-limit');
  if (!dailyUsed || !dailyLimit || !monthlyUsed || !monthlyLimit) return null;

  return {
    dailyUsed: Number.parseInt(dailyUsed, 10),
    dailyLimit: Number.parseInt(dailyLimit, 10),
    monthlyUsed: Number.parseInt(monthlyUsed, 10),
    monthlyLimit: Number.parseInt(monthlyLimit, 10),
  };
};

const exit = (message: string, hint?: string): never => {
  console.error(chalk.red(message));
  if (hint) console.error(chalk.dim(hint));
  process.exit(1);
};

const handleError = (error: unknown): never => {
  if (!(error instanceof HttpError)) {
    return exit('Cannot reach API. Check your internet connection.');
  }

  if (error.status === 401) return exit('Invalid or missing API key.', 'Run `csc auth login` to set your key.');
  if (error.status === 403) return exit('Access denied — this endpoint requires a higher plan.', 'Run `csc upgrade` to view available plans.');
  if (error.status === 429) {
    console.error(chalk.red('Daily limit reached.'));
    console.error(chalk.yellow('Run `csc upgrade` to increase your limits.'));
    process.exit(1);
  }
  if (error.status === 404) return exit('Not found.');
  return exit(`API error: ${error.message}`);
};

const request = async <T>(path: string, apiKey: string): Promise<ApiResponse<T>> => {
  const response = await fetch(`${getApiBase()}${path}`, {
    headers: { 'X-CSCAPI-KEY': apiKey, 'User-Agent': USER_AGENT },
  });
  if (!response.ok) throw new HttpError(response.status, response.statusText);
  const data = await response.json() as T;
  return { data, usage: extractUsage(response.headers) };
};

/** Makes an authenticated GET request to the CSC API. */
export const get = async <T>(path: string): Promise<ApiResponse<T>> => {
  const apiKey = getApiKey();
  if (!apiKey) return exit('Not authenticated.', 'Run `csc auth login` to set your API key.');

  try {
    return await request<T>(path, apiKey);
  } catch (error) {
    return handleError(error);
  }
};

/** Validates an API key with a lightweight request. */
export const validateKey = async (apiKey: string): Promise<{ valid: boolean; usage: UsageInfo | null }> => {
  try {
    const response = await fetch(`${getApiBase()}/countries/IN`, {
      headers: { 'X-CSCAPI-KEY': apiKey, 'User-Agent': USER_AGENT },
    });
    if (!response.ok) return { valid: false, usage: null };
    return { valid: true, usage: extractUsage(response.headers) };
  } catch {
    return { valid: false, usage: null };
  }
};
