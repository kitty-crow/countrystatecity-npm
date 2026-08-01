#!/usr/bin/env node
import { get } from 'node:https';
import type { IncomingMessage } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { ensureDir, writeJson } from './lib/fs.ts';
import { fail } from './lib/args.ts';
import { readSource } from './lib/source.ts';

const src = 'https://github.com/dr5hn/countries-states-cities-database/releases/latest/download/json-countries%2Bstates%2Bcities.json.gz';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'data', 'source.json');

const body = (res: IncomingMessage): Promise<Buffer> => new Promise((resolve, reject) => {
  const chunks: Buffer[] = [];
  res.on('data', (chunk: Buffer | string) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
  res.once('end', () => resolve(Buffer.concat(chunks)));
  res.once('error', reject);
});

const download = async (url: string, hops = 0): Promise<Buffer> => {
  if (hops > 10) throw new Error('Too many redirects');
  return new Promise((resolve, reject) => {
    const req = get(url, { headers: { 'user-agent': 'countrystatecity-monorepo' } }, async res => {
      try {
        const code = res.statusCode ?? 0;
        const next = res.headers.location;
        if (code >= 300 && code < 400 && next) {
          console.log(`  ↳ Redirecting (${code})...`);
          res.resume();
          resolve(await download(new URL(next, url).toString(), hops + 1));
          return;
        }
        if (code !== 200) {
          res.resume();
          throw new Error(`HTTP ${code} from ${url}`);
        }
        resolve(await body(res));
      } catch (err) {
        reject(err);
      }
    });
    req.once('error', reject);
  });
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
  console.log('Run pnpm generate-data to distribute to all packages.');
};

main().catch(fail);
