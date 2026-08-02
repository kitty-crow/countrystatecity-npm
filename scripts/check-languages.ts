import { readdirSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail } from './lib/args.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skip = new Set(['.git', 'node_modules', 'dist', 'coverage', '.turbo']);
const source = new Set([
  '.js',
  '.cjs',
  '.mjs',
  '.jsx',
  '.html',
  '.htm',
  '.css',
  '.sh',
  '.bash',
  '.zsh',
  '.fish',
]);

const scan = (dir: string, out: string[]): void => {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (item.isDirectory() && skip.has(item.name)) continue;
    const file = join(dir, item.name);
    if (item.isDirectory()) {
      scan(file, out);
      continue;
    }
    if (source.has(extname(item.name))) out.push(relative(root, file));
  }
};

const main = (): void => {
  const files: string[] = [];
  scan(root, files);
  files.sort();
  if (files.length === 0) {
    console.log('✓ Maintained code is TypeScript-only');
    return;
  }
  throw new Error(`Non-TypeScript source remains:\n${files.map(file => `- ${file}`).join('\n')}`);
};

try {
  main();
} catch (err) {
  fail(err);
}
