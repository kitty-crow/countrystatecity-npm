#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail } from './lib/args.ts';

interface Pkg {
  readonly name: string;
  version: string;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const packages = ['countries', 'countries-browser', 'timezones', 'currencies', 'translations', 'phonecodes'] as const;

const bump = (version: string): string => {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3 || parts.some(part => !Number.isInteger(part) || part < 0)) {
    throw new Error(`Invalid semantic version: ${version}`);
  }
  const [major, minor, patch] = parts;
  if (major === undefined || minor === undefined || patch === undefined) throw new Error(`Invalid semantic version: ${version}`);
  return `${major}.${minor}.${patch + 1}`;
};

const main = (): void => {
  for (const dir of packages) {
    const pkgFile = join(root, 'packages', dir, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgFile, 'utf8')) as Pkg;
    const old = pkg.version;
    pkg.version = bump(old);
    writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`);

    const changelog = join(root, 'packages', dir, 'CHANGELOG.md');
    const current = readFileSync(changelog, 'utf8');
    const entry = `\n## ${pkg.version}\n\n### Patch Changes\n\n- Updated data from countries-states-cities-database\n`;
    const split = current.indexOf('\n');
    const next = split < 0 ? `${current}${entry}\n` : `${current.slice(0, split)}${entry}${current.slice(split)}\n`;
    writeFileSync(changelog, next.replace(/\n{3,}/g, '\n\n'));
    console.log(`${pkg.name}: ${old} → ${pkg.version}`);
  }
};

try {
  main();
} catch (err) {
  fail(err);
}
