#!/usr/bin/env node
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail } from './lib/args.ts';
import { exists } from './lib/fs.ts';
import { run, runAll, type Job } from './lib/proc.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'data', 'source.json');
const node = process.versions['bun'] ? [process.execPath] : [process.execPath, '--import', 'tsx'];

const job = (name: string, arg = src): Job => ({
  name,
  cwd: join(root, 'packages', name),
  cmd: [...node, 'scripts/generate-data.ts', arg],
});

const main = async (): Promise<void> => {
  if (!exists(src)) throw new Error('data/source.json not found. Run: npm run fetch-database');
  console.log('🚀 Generating data for all packages...');
  console.log(`   Source: ${src}\n`);
  console.log('── Batch 1: source database packages ──');
  await runAll([
    job('countries'),
    job('timezones'),
    job('currencies'),
    job('translations'),
    job('phonecodes'),
  ]);
  const countryData = join(root, 'packages', 'countries', 'src', 'data');
  if (!exists(countryData)) throw new Error('countries data was not generated');
  console.log('\n── Batch 2: browser data ──');
  await run(job('countries-browser', countryData));
  console.log('\n✅ All packages updated successfully.');
  console.log('   Run: npm run build\n');
};

main().catch(fail);
