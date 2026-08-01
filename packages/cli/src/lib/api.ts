import axios, { AxiosError } from 'axios';
import chalk from 'chalk';
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

type Headers = Record<string, string | number | undefined>;

function readHeader(headers: Headers, name: string): string | undefined {
  const value = headers[name];
  return value === undefined ? undefined : String(value);
}

/** Extracts usage stats when all quota headers are present. */
function extractUsage(headers: Headers): UsageInfo | null {
  const dailyUsed = readHeader(headers, 'x-csc-daily-used');
  const dailyLimit = readHeader(headers, 'x-csc-daily-limit');
  const monthlyUsed = readHeader(headers, 'x-csc-monthly-used');
  const monthlyLimit = readHeader(headers, 'x-csc-monthly-limit');
  if (!dailyUsed || !dailyLimit || !monthlyUsed || !monthlyLimit) return null;

  return {
    dailyUsed: Number.parseInt(dailyUsed, 10),
    dailyLimit: Number.parseInt(dailyLimit, 10),
    monthlyUsed: Number.parseInt(monthlyUsed, 10),
    monthlyLimit: Number.parseInt(monthlyLimit, 10),
  };
}

function exit(message: string, hint?: string): never {
  console.error(chalk.red(message));
  if (hint) console.error(chalk.dim(hint));
  process.exit(1);
}

function handleError(error: unknown): never {
  if (!(error instanceof AxiosError)) {
    return exit('Cannot reach API. Check your internet connection.');
  }

  const status = error.response?.status;
  if (status === 401) return exit('Invalid or missing API key.', 'Run `csc auth login` to set your key.');
  if (status === 403) return exit('Access denied — this endpoint requires a higher plan.', 'Run `csc upgrade` to view available plans.');
  if (status === 429) {
    console.error(chalk.red('Daily limit reached.'));
    console.error(chalk.yellow('Run `csc upgrade` to increase your limits.'));
    process.exit(1);
  }
  if (status === 404) return exit('Not found.');
  return exit(`API error: ${error.message}`);
}

/** Makes an authenticated GET request to the CSC API. */
export async function get<T>(path: string): Promise<ApiResponse<T>> {
  const apiKey = getApiKey();
  if (!apiKey) return exit('Not authenticated.', 'Run `csc auth login` to set your API key.');

  try {
    const res = await axios.get<T>(`${getApiBase()}${path}`, {
      headers: { 'X-CSCAPI-KEY': apiKey, 'User-Agent': USER_AGENT },
    });
    return { data: res.data, usage: extractUsage(res.headers as Headers) };
  } catch (error) {
    return handleError(error);
  }
}

/** Validates an API key with a lightweight request. */
export async function validateKey(apiKey: string): Promise<{ valid: boolean; usage: UsageInfo | null }> {
  try {
    const res = await axios.get(`${getApiBase()}/countries/IN`, {
      headers: { 'X-CSCAPI-KEY': apiKey, 'User-Agent': USER_AGENT },
    });
    return { valid: true, usage: extractUsage(res.headers as Headers) };
  } catch {
    return { valid: false, usage: null };
  }
}
