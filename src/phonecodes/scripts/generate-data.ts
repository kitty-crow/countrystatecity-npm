#!/usr/bin/env node
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, sourceArg } from '../../../scripts/lib/args.ts';
import { kb, writeJson } from '../../../scripts/lib/fs.ts';
import { readSource } from '../../../scripts/lib/source.ts';
import type { IPhonecode } from '../types.ts';

const here = dirname(fileURLToPath(import.meta.url));

export const generate = (src: string, out: string): void => {
  console.log('Generating phonecode data...\n');
  console.log(`📥 Loading source data from: ${src}`);
  const countries = readSource(src);
  console.log(`✓ Loaded ${countries.length} countries`);
  const rows: IPhonecode[] = [];
  for (const country of countries) {
    const phonecode = country.phonecode.trim();
    if (!phonecode) continue;
    rows.push({ iso2: country.iso2, name: country.name, dialCode: `+${phonecode}`, phonecode });
  }
  rows.sort((a, b) => a.iso2.localeCompare(b.iso2));
  writeJson(out, rows);
  console.log(`\n✓ Written ${rows.length} entries to phonecodes.json (${kb(out).toFixed(2)} KB)`);
  console.log('\n✨ Phonecode data generation complete!');
};

try {
  generate(sourceArg('tsx scripts/generate-data.ts <source-file-path> [output-file]'), process.argv[3] ?? join(here, '..', 'data', 'phonecodes.json'));
} catch (err) {
  fail(err);
}
