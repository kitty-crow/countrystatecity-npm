#!/usr/bin/env node
const fs: typeof import('node:fs') = require('node:fs');
const os: typeof import('node:os') = require('node:os');
const path: typeof import('node:path') = require('node:path');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'csc-ts-node-'));
const file = path.join(dir, 'value.json');
try {
  fs.writeFileSync(file, JSON.stringify({ ok: true }), 'utf8');
  const value = JSON.parse(fs.readFileSync(file, 'utf8')) as { ok?: unknown };
  if (value.ok !== true) throw new Error('ts-node runtime smoke test failed');
  console.log(`✓ Repository TypeScript runs through ts-node on ${process.version}`);
} finally {
  fs.rmSync(dir, { force: true, recursive: true });
}
