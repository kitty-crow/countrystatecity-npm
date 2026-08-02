#!/usr/bin/env node
import { copyFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail } from '../../../scripts/lib/args.ts';
import { ensureDir, readJson, resetDir } from '../../../scripts/lib/fs.ts';

const here = dirname(fileURLToPath(import.meta.url));
const code = (name: string): string => name.slice(name.lastIndexOf('-') + 1);
const count = (file: string): number => {
  const value = readJson(file);
  if (!Array.isArray(value)) throw new TypeError(`Expected an array in ${file}`);
  return value.length;
};

export const generate = (src: string, out: string): void => {
  console.log(`📥 Reading server data from: ${src}`);
  console.log('🗑️  Removing existing data directory...');
  resetDir(out);
  const countryOut = join(out, 'country');
  const statesOut = join(out, 'states');
  const citiesOut = join(out, 'cities');
  [countryOut, statesOut, citiesOut].forEach(ensureDir);

  const countriesFile = join(src, 'countries.json');
  if (!existsSync(countriesFile)) throw new Error(`countries.json not found at ${countriesFile}`);
  copyFileSync(countriesFile, join(out, 'countries.json'));
  const countries = count(countriesFile);
  console.log(`✓ Copied countries.json (${countries} countries)`);

  const dirs = readdirSync(src, { withFileTypes: true }).filter(item => item.isDirectory());
  let states = 0;
  let cityFiles = 0;
  for (const dir of dirs) {
    const iso2 = code(dir.name);
    const country = join(src, dir.name);
    const meta = join(country, 'meta.json');
    if (existsSync(meta)) copyFileSync(meta, join(countryOut, `${iso2}.json`));
    const stateFile = join(country, 'states.json');
    if (existsSync(stateFile)) {
      copyFileSync(stateFile, join(statesOut, `${iso2}.json`));
      states += count(stateFile);
    }
    for (const state of readdirSync(country, { withFileTypes: true })) {
      if (!state.isDirectory()) continue;
      const file = join(country, state.name, 'cities.json');
      if (!existsSync(file)) continue;
      copyFileSync(file, join(citiesOut, `${iso2}-${code(state.name)}.json`));
      cityFiles += 1;
    }
  }

  console.log('\n✅ Browser data generation complete!');
  console.log('📊 Statistics:');
  console.log(`   - Countries: ${countries}`);
  console.log(`   - Country directories processed: ${dirs.length}`);
  console.log(`   - Total states: ${states}`);
  console.log(`   - City files created: ${cityFiles}`);
  console.log(`   - Output directory: ${out}`);
};

const src = process.argv[2] ?? fail(new Error('Source data directory required\nUsage: tsx scripts/generate-data.ts <server-data-dir> [output-dir]'));
const input = resolve(src);
if (!existsSync(input)) fail(new Error(`Source directory not found: ${input}`));
const out = resolve(process.argv[3] ?? join(here, '..', 'src', 'data'));
try {
  generate(input, out);
} catch (err) {
  fail(err);
}
