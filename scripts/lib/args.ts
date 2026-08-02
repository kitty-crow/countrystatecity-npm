import { resolve } from 'node:path';
import { exists } from './fs.ts';

export const sourceArg = (usage: string): string => {
  const raw = process.argv[2];
  if (!raw) throw new Error(`Source path required.\nUsage: ${usage}`);
  const file = resolve(raw);
  if (!exists(file)) throw new Error(`Source not found: ${file}`);
  return file;
};

export const dirArg = (index: number, fallback: string): string => resolve(process.argv[index] ?? fallback);

export const fail = (err: unknown): never => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`❌ ${msg}`);
  process.exit(1);
};
