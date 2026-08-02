#!/usr/bin/env node
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, sourceArg } from '../../../scripts/lib/args.ts';
import { ensureDir, kb, writeJson } from '../../../scripts/lib/fs.ts';
import { readSource } from '../../../scripts/lib/source.ts';
import type { ITimezone, ITimezoneAbbreviation } from '../src/types.ts';

const here = dirname(fileURLToPath(import.meta.url));

export const generate = (src: string, data: string): void => {
  console.log('Generating timezone data...\n');
  console.log(`📥 Loading source data from: ${src}`);
  const countries = readSource(src);
  console.log(`✓ Loaded ${countries.length} countries`);
  const byCountry = join(data, 'by-country');
  ensureDir(byCountry);
  const rows: ITimezone[] = [];
  const seen = new Set<string>();
  const abbr = new Map<string, ITimezoneAbbreviation>();
  let processed = 0;

  for (const country of countries) {
    if (!country.timezones) {
      console.log(`  ⚠️  Skipping ${country.name} (no timezones data)`);
      continue;
    }
    const list: ITimezone[] = country.timezones.map(tz => ({
      zoneName: tz.zoneName,
      countryCode: country.iso2,
      abbreviation: tz.abbreviation,
      gmtOffset: tz.gmtOffset,
      gmtOffsetName: tz.gmtOffsetName,
      tzName: tz.tzName,
    }));
    for (const tz of list) {
      const key = `${tz.zoneName}\0${tz.countryCode}`;
      if (!seen.has(key)) {
        seen.add(key);
        rows.push(tz);
      }
      if (!tz.abbreviation) continue;
      let item = abbr.get(tz.abbreviation);
      if (!item) {
        item = { abbreviation: tz.abbreviation, name: tz.tzName, timezones: [] };
        abbr.set(tz.abbreviation, item);
      }
      if (!item.timezones.includes(tz.zoneName)) item.timezones.push(tz.zoneName);
    }
    writeJson(join(byCountry, `${country.iso2}.json`), list);
    processed += 1;
    if (processed % 50 === 0) console.log(`  Processed ${processed} countries...`);
  }

  console.log(`\n✓ Processed ${processed} countries`);
  const allFile = join(data, 'timezones.json');
  writeJson(allFile, rows);
  console.log(`✓ Written ${rows.length} timezones to timezones.json`);
  const abbreviations = [...abbr.values()].sort((a, b) => a.abbreviation.localeCompare(b.abbreviation));
  writeJson(join(data, 'abbreviations.json'), abbreviations);
  console.log(`✓ Written ${abbreviations.length} abbreviations to abbreviations.json`);
  const files = readdirSync(byCountry);
  const average = files.length ? files.reduce((sum, file) => sum + kb(join(byCountry, file)), 0) / files.length : 0;
  console.log('\n📊 Statistics:');
  console.log(`  Total timezones: ${rows.length}`);
  console.log(`  Countries with timezones: ${processed}`);
  console.log(`  Unique abbreviations: ${abbreviations.length}`);
  console.log(`  Main file size: ${kb(allFile).toFixed(2)} KB`);
  console.log(`  Average country file size: ${average.toFixed(2)} KB`);
  console.log('\n✨ Timezone data generation complete!');
};

try {
  generate(sourceArg('tsx scripts/generate-data.ts <source-file-path> [output-dir]'), process.argv[3] ?? join(here, '..', 'src', 'data'));
} catch (err) {
  fail(err);
}
