#!/usr/bin/env node
import { readdirSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail } from './lib/args.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skip = new Set(['.git', 'node_modules', 'dist', 'coverage', '.turbo']);
const js = new Set(['.js', '.cjs', '.mjs', '.jsx']);
const isJs = (name: string): boolean => js.has(extname(name));

const scan = (dir: string, out: string[]): void => {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (item.isDirectory() && skip.has(item.name)) continue;
    const file = join(dir, item.name);
    if (item.isDirectory()) {
      scan(file, out);
      continue;
    }
    if (isJs(item.name)) out.push(relative(root, file));
  }
};

const main = (): void => {
  const files: string[] = [];
  scan(root, files);
  files.sort();
  if (files.length === 0) {
    console.log('✓ No JavaScript source files');
    return;
  }
  throw new Error(`JavaScript source files remain:\n${files.map(file => `- ${file}`).join('\n')}`);
};

try {
  main();
} catch (err) {
  fail(err);
}
