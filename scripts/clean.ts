#!/usr/bin/env node
import { readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const remove = (path: string): void => rmSync(path, { force: true, recursive: true });

for (const name of ['.turbo', 'coverage', 'dist']) remove(join(root, name));
for (const item of readdirSync(join(root, 'packages'), { withFileTypes: true })) {
  if (!item.isDirectory()) continue;
  for (const name of ['.turbo', 'coverage', 'dist', 'node_modules']) {
    remove(join(root, 'packages', item.name, name));
  }
}
remove(join(root, 'node_modules'));
console.log('✓ Removed build, cache and dependency directories');
