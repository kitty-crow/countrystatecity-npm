import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ICurrency } from './types.ts';

let cache: ICurrency[] | undefined;

export const load = (): ICurrency[] => {
  if (cache) return cache;
  const dir = dirname(fileURLToPath(import.meta.url));
  cache = JSON.parse(readFileSync(join(dir, 'data', 'currencies.json'), 'utf8')) as ICurrency[];
  return cache;
};
