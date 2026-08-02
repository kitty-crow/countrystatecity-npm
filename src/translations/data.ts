import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ICountryTranslation } from './types.ts';

let cache: ICountryTranslation[] | undefined;
let index: Map<string, ICountryTranslation> | undefined;

export const load = (): ICountryTranslation[] => {
  if (cache) return cache;
  const dir = dirname(fileURLToPath(import.meta.url));
  cache = JSON.parse(readFileSync(join(dir, 'data', 'translations.json'), 'utf8')) as ICountryTranslation[];
  index = new Map(cache.map(item => [item.iso2.toUpperCase(), item]));
  return cache;
};

export const find = (iso2: string): ICountryTranslation | undefined => {
  load();
  return index?.get(iso2.toUpperCase());
};
