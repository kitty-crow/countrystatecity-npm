import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail } from './lib/args.ts';
import { run } from './lib/proc.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const main = async (): Promise<void> => {
  const [fixtureName, packageName, label] = process.argv.slice(2);
  if (!fixtureName || !packageName || !label) {
    throw new Error('Expected fixture path, package path and test label');
  }

  const fixture = resolve(root, fixtureName);
  const pkg = resolve(root, packageName);
  if (!existsSync(join(pkg, 'dist'))) {
    throw new Error(`${packageName} is not built; run pnpm build first`);
  }

  console.log(`Testing ${label}`);
  await run({
    name: 'Install fixture dependencies',
    cmd: ['npm', 'install', '--silent'],
    cwd: fixture,
  });
  await run({
    name: `Link ${packageName}`,
    cmd: ['npm', 'install', pkg, '--silent'],
    cwd: fixture,
  });
  await run({
    name: `Build ${label}`,
    cmd: ['npm', 'run', 'build'],
    cwd: fixture,
  });
  console.log(`✓ ${label} build succeeded`);
};

main().catch(fail);
