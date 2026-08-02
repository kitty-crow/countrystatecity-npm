import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export const exists = (file: string): boolean => existsSync(file);

export const ensureDir = (dir: string): void => {
  mkdirSync(dir, { recursive: true });
};

export const resetDir = (dir: string): void => {
  if (exists(dir)) rmSync(dir, { recursive: true });
  ensureDir(dir);
};

export const readText = (file: string): string => readFileSync(file, 'utf8');

export const readJson = (file: string): unknown => {
  try {
    return JSON.parse(readText(file)) as unknown;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Cannot parse ${file}: ${msg}`);
  }
};

export const writeJson = (file: string, value: unknown): void => {
  ensureDir(dirname(file));
  writeFileSync(file, JSON.stringify(value, null, 2));
};

export const kb = (file: string): number => statSync(file).size / 1024;
