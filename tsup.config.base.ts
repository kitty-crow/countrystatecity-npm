import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Options } from 'tsup';

export const baseConfig: Options = {
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
};

export const copyDir = (src: string, dest: string): void => {
  mkdirSync(dest, { recursive: true });
  for (const item of readdirSync(src, { withFileTypes: true })) {
    const from = join(src, item.name);
    const to = join(dest, item.name);
    if (item.isDirectory()) {
      copyDir(from, to);
      continue;
    }
    copyFileSync(from, to);
  }
};
