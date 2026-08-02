import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IPhonecode } from './types.ts';

let cache: IPhonecode[] | undefined;

export const load = (): IPhonecode[] => {
  if (cache) return cache;
  const dir = dirname(fileURLToPath(import.meta.url));
  cache = JSON.parse(readFileSync(join(dir, 'data', 'phonecodes.json'), 'utf8')) as IPhonecode[];
  return cache;
};
