#!/usr/bin/env node
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readJson, writeJson } from './lib/fs.ts';

const dir = mkdtempSync(join(tmpdir(), 'csc-runtime-'));
const file = join(dir, 'value.json');
try {
  writeJson(file, { ok: true });
  const value = readJson(file) as { ok?: unknown };
  if (value.ok !== true) throw new Error('TypeScript runtime smoke test failed');
  const runtime = process.versions['bun'] ? `Bun ${process.versions['bun']}` : `Node ${process.version}`;
  console.log(`✓ Repository TypeScript runs on ${runtime}`);
} finally {
  rmSync(dir, { force: true, recursive: true });
}
