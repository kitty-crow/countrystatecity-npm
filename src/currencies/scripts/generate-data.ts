#!/usr/bin/env node
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, sourceArg } from '../../../scripts/lib/args.ts';
import { ensureDir, exists, kb, readJson, writeJson } from '../../../scripts/lib/fs.ts';
import { readSource } from '../../../scripts/lib/source.ts';
import type { ICurrency } from '../types.ts';

const here = dirname(fileURLToPath(import.meta.url));
const currency = (value: unknown): value is ICurrency => {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return typeof item['code'] === 'string'
    && typeof item['name'] === 'string'
    && typeof item['namePlural'] === 'string'
    && typeof item['symbol'] === 'string'
    && typeof item['symbolNative'] === 'string'
    && typeof item['decimalDigits'] === 'number'
    && typeof item['rounding'] === 'number'
    && Array.isArray(item['countries'])
    && item['countries'].every(code => typeof code === 'string');
};

const supplements = (file: string): Map<string, ICurrency> => {
  if (!exists(file)) return new Map();
  const value = readJson(file);
  if (!Array.isArray(value) || !value.every(currency)) throw new TypeError(`Invalid currency data: ${file}`);
  return new Map(value.map(item => [item['code'], item]));
};

export const generate = (src: string, out: string): void => {
  console.log('Generating currency data...\n');
  const countries = readSource(src);
  console.log(`📥 Loading source data from: ${src}`);
  console.log(`✓ Loaded ${countries.length} countries`);
  ensureDir(dirname(out));
  const old = supplements(out);
  if (old.size) console.log(`✓ Loaded ${old.size} existing currencies as supplement`);
  const map = new Map<string, ICurrency>();

  for (const country of countries) {
    if (!country.currency || !country.currency_name) continue;
    const code = country.currency.toUpperCase();
    let item = map.get(code);
    if (!item) {
      const prev = old.get(code);
      item = {
        code,
        name: country.currency_name,
        namePlural: prev?.namePlural ?? country.currency_name,
        symbol: country.currency_symbol || code,
        symbolNative: prev?.symbolNative ?? (country.currency_symbol || code),
        decimalDigits: prev?.decimalDigits ?? 2,
        rounding: prev?.rounding ?? 0,
        countries: [],
      };
      map.set(code, item);
    }
    if (!item['countries'].includes(country.iso2)) item['countries'].push(country.iso2);
  }

  const rows = [...map.values()]
    .map(item => ({ ...item, countries: item['countries'].sort() }))
    .sort((a, b) => a.code.localeCompare(b.code));
  writeJson(out, rows);
  console.log(`\n✓ Written ${rows.length} currencies to currencies.json`);
  console.log('\n📊 Statistics:');
  console.log(`  Total currencies: ${rows.length}`);
  console.log(`  Total country mappings: ${rows.reduce((sum, item) => sum + item['countries'].length, 0)}`);
  console.log(`  File size: ${kb(out).toFixed(2)} KB`);
  console.log('\n✨ Currency data generation complete!');
};

try {
  generate(sourceArg('tsx scripts/generate-data.ts <source-file-path> [output-file]'), process.argv[3] ?? join(here, '..', 'data', 'currencies.json'));
} catch (err) {
  fail(err);
}
