#!/usr/bin/env node
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, sourceArg } from '../../../scripts/lib/args.ts';
import { kb, writeJson } from '../../../scripts/lib/fs.ts';
import { readSource } from '../../../scripts/lib/source.ts';
import type { ICountryTranslation } from '../types.ts';

const here = dirname(fileURLToPath(import.meta.url));

export const generate = (src: string, out: string): void => {
  console.log('Generating translation data...\n');
  console.log(`📥 Loading source data from: ${src}`);
  const countries = readSource(src);
  console.log(`✓ Loaded ${countries.length} countries`);
  const locales = new Set<string>();
  const rows: ICountryTranslation[] = [];
  for (const country of countries) {
    if (!country.iso2 || !country.name) continue;
    const translations = Object.fromEntries(
      Object.entries(country.translations ?? {}).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && Boolean(entry[1].trim())),
    );
    Object.keys(translations).forEach(locale => locales.add(locale));
    rows.push({ iso2: country.iso2.toUpperCase(), name: country.name, translations });
  }
  rows.sort((a, b) => a.iso2.localeCompare(b.iso2));
  writeJson(out, rows);
  const localeList = [...locales].sort();
  console.log(`\n✓ Written ${rows.length} countries to translations.json`);
  console.log('\n📊 Statistics:');
  console.log(`  Total countries: ${rows.length}`);
  console.log(`  Total locales: ${localeList.length}`);
  console.log(`  Locales: ${localeList.join(', ')}`);
  console.log(`  File size: ${kb(out).toFixed(2)} KB`);
  console.log('\n✨ Translation data generation complete!');
};

try {
  generate(sourceArg('tsx scripts/generate-data.ts <source-file-path> [output-file]'), process.argv[3] ?? join(here, '..', 'data', 'translations.json'));
} catch (err) {
  fail(err);
}
