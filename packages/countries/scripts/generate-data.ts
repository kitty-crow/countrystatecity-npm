#!/usr/bin/env node
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail } from '../../../scripts/lib/args.ts';
import { readSource, type SrcCountry, type SrcState } from '../../../scripts/lib/source.ts';
import { writeJson } from '../../../scripts/lib/fs.ts';
import type { ICity, ICountry, ICountryMeta, IState } from '../src/types.ts';

const here = dirname(fileURLToPath(import.meta.url));
const safe = (name: string, code: string): string => `${name.replace(/\s+/g, '_')}-${code}`;

const countryRow = (c: SrcCountry): ICountry => ({
  id: c.id,
  name: c.name,
  iso2: c.iso2,
  iso3: c.iso3,
  numeric_code: c.numeric_code,
  phonecode: c.phonecode,
  capital: c.capital,
  currency: c.currency,
  currency_name: c.currency_name,
  currency_symbol: c.currency_symbol,
  tld: c.tld,
  native: c.native,
  region: c.region,
  subregion: c.subregion,
  nationality: c.nationality,
  latitude: c.latitude,
  longitude: c.longitude,
  emoji: c.emoji,
  emojiU: c.emojiU,
});

const stateRow = (c: SrcCountry, s: SrcState): IState => ({
  id: s.id,
  name: s.name,
  country_id: c.id,
  country_code: c.iso2,
  fips_code: null,
  iso2: s.iso2,
  type: s.type ?? null,
  latitude: s.latitude,
  longitude: s.longitude,
  native: s.native ?? null,
  timezone: s.timezone ?? null,
  translations: {},
});

const cityRows = (c: SrcCountry, s: SrcState): ICity[] => (s.cities ?? []).map(city => ({
  id: city.id,
  name: city.name,
  state_id: s.id,
  state_code: s.iso2,
  country_id: c.id,
  country_code: c.iso2,
  latitude: city.latitude,
  longitude: city.longitude,
  native: null,
  timezone: city.timezone ?? null,
  translations: {},
}));

export const generate = (src: string, root: string): void => {
  console.log('📥 Loading source data...');
  const countries = readSource(src);
  console.log(`✓ Loaded ${countries.length} countries`);
  const data = join(root, 'src', 'data');
  if (existsSync(data)) {
    console.log('🗑️  Removing existing data directory...');
    rmSync(data, { recursive: true });
  }
  mkdirSync(data, { recursive: true });

  console.log('\n📝 Generating countries.json...');
  const rows = countries.map(countryRow);
  const byId = new Map(rows.map(row => [row.id, row]));
  writeJson(join(data, 'countries.json'), rows);
  console.log(`✓ Created countries.json (${rows.length} countries)`);

  let states = 0;
  let cities = 0;
  let populated = 0;
  countries.forEach((country, index) => {
    if ((index + 1) % 50 === 0) console.log(`  Processing country ${index + 1}/${countries.length}...`);
    if (!country.states?.length) return;
    populated += 1;
    const dir = join(data, safe(country.name, country.iso2));
    mkdirSync(dir, { recursive: true });
    const base = byId.get(country.id);
    if (!base) throw new Error(`Country list entry missing for ${country.iso2}`);
    const meta: ICountryMeta = {
      ...base,
      timezones: [...(country.timezones ?? [])],
      translations: { ...(country.translations ?? {}) },
    };
    writeJson(join(dir, 'meta.json'), meta);
    const stateList = country.states.map(state => stateRow(country, state));
    writeJson(join(dir, 'states.json'), stateList);
    states += stateList.length;

    for (const state of country.states) {
      if (!state.cities?.length) continue;
      const list = cityRows(country, state);
      writeJson(join(dir, safe(state.name, state.iso2), 'cities.json'), list);
      cities += list.length;
    }
  });

  console.log('\n✅ Data generation complete!');
  console.log('📊 Statistics:');
  console.log(`   - Countries: ${countries.length}`);
  console.log(`   - Countries with states/cities: ${populated}`);
  console.log(`   - States: ${states}`);
  console.log(`   - Cities: ${cities}`);
  console.log(`   - Output directory: ${data}`);
};

const src = process.argv[2] ?? '/tmp/countries-data.json';
const root = process.argv[3] ?? join(here, '..');
if (!existsSync(src)) fail(new Error(`Source file not found: ${src}`));
try {
  generate(src, root);
} catch (err) {
  fail(err);
}
