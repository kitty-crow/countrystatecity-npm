import { base, fs, isNode, path } from './node.ts';

type Json<T> = { readonly default: T };

const browser = (): Error => new Error(
  '@countrystatecity/countries cannot load data in browser environments. '
  + 'This package is designed for server-side use only. '
  + 'Please use one of these approaches:\n'
  + '1. Create an API endpoint that calls this package on the server\n'
  + '2. Generate static JSON at build time\n'
  + '3. Use in SSR/SSG context only (e.g., SvelteKit load functions, Next.js server components)\n'
  + 'See documentation at: https://github.com/dr5hn/countrystatecity/tree/main/packages/countries#readme',
);

export const json = async <T>(file: string): Promise<T> => {
  let first: unknown;
  try {
    const mod = await import(/* @vite-ignore */ file, { assert: { type: 'json' } }) as Json<T>;
    return mod.default;
  } catch (err) {
    first = err;
  }
  if (!isNode()) throw browser();
  try {
    const [io, p, dir] = await Promise.all([fs(), path(), base()]);
    const files = [
      p.join(dir, file),
      p.join(dir, '..', file),
      p.join(process.cwd(), 'node_modules', '@countrystatecity', 'countries', 'dist', file),
    ];
    for (const candidate of files) {
      try {
        return JSON.parse(io.readFileSync(candidate, 'utf8')) as T;
      } catch {
        continue;
      }
    }
  } catch {
    // Preserve the original import error, matching the pre-refactor loader.
  }
  throw first;
};

let countries: Map<string, string> | undefined;
const states = new Map<string, Map<string, string>>();

const code = (name: string): string | undefined => {
  const parts = name.split('-');
  return parts[parts.length - 1];
};

const dirs = async (dir: string): Promise<Map<string, string>> => {
  const [io, p, root] = await Promise.all([fs(), path(), base()]);
  const map = new Map<string, string>();
  for (const item of io.readdirSync(p.join(root, 'data', dir), { withFileTypes: true })) {
    if (!item.isDirectory()) continue;
    const key = code(item.name);
    if (key) map.set(key, item.name);
  }
  return map;
};

export const countryDir = async (countryCode: string): Promise<string | null> => {
  countries ??= await dirs('');
  return countries.get(countryCode) ?? null;
};

export const stateDir = async (countryCode: string, stateCode: string): Promise<string | null> => {
  const country = await countryDir(countryCode);
  if (!country) return null;
  let map = states.get(countryCode);
  if (!map) {
    map = await dirs(country);
    states.set(countryCode, map);
  }
  return map.get(stateCode) ?? null;
};
