#!/usr/bin/env node
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { ensureDir, writeJson } from './lib/fs.ts';
import { fail } from './lib/args.ts';
import { readSource } from './lib/source.ts';

const src = 'https://github.com/dr5hn/countries-states-cities-database/releases/latest/download/json-countries%2Bstates%2Bcities.json.gz';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'data', 'source.json');

const download = async (url: string): Promise<Buffer> => {
  const response = await fetch(url, { headers: { 'user-agent': 'countrystatecity-monorepo' } });
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
  return Buffer.from(await response.arrayBuffer());
};

const main = async (): Promise<void> => {
  console.log('📥 Fetching latest countries-states-cities database...');
  console.log(`   Source: ${src}\n`);
  const zip = await download(src);
  console.log(`✓ Downloaded ${(zip.length / 1024 / 1024).toFixed(2)} MB (compressed)`);
  const raw = gunzipSync(zip);
  console.log(`✓ Decompressed to ${(raw.length / 1024 / 1024).toFixed(2)} MB`);
  ensureDir(dirname(out));
  const parsed = JSON.parse(raw.toString('utf8')) as unknown;
  writeJson(out, parsed);
  const countries = readSource(out);
  console.log(`✓ Saved to data/source.json (${countries.length} countries)\n`);
  console.log('Run npm run generate-data to distribute to all packages.');
};

main().catch(fail);
