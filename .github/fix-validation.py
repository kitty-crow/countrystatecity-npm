from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]

manifest = root / 'packages/cli/package.json'
pkg = json.loads(manifest.read_text(encoding='utf-8'))
pkg['dependencies']['@inquirer/select'] = '^5.2.1'
pkg['dependencies'] = dict(sorted(pkg['dependencies'].items()))
manifest.write_text(json.dumps(pkg, indent=2) + '\n', encoding='utf-8')

root_manifest = root / 'package.json'
root_pkg = json.loads(root_manifest.read_text(encoding='utf-8'))
root_pkg['scripts']['check:runtime:ts-node'] = 'ts-node scripts/runtime-smoke.cts'
root_manifest.write_text(json.dumps(root_pkg, indent=2) + '\n', encoding='utf-8')

config = root / 'packages/cli/src/lib/config.ts'
value = config.read_text(encoding='utf-8')
old = """    return {
      apiKey: typeof value['apiKey'] === 'string' ? value['apiKey'] : undefined,
      apiBase: typeof value['apiBase'] === 'string' ? value['apiBase'] : undefined,
    };
"""
new = """    const config: Config = {};
    if (typeof value['apiKey'] === 'string') config.apiKey = value['apiKey'];
    if (typeof value['apiBase'] === 'string') config.apiBase = value['apiBase'];
    return config;
"""
if old not in value:
    raise RuntimeError('Native config return block was not found')
config.write_text(value.replace(old, new), encoding='utf-8')

(root / 'scripts/runtime-smoke.cts').write_text("""#!/usr/bin/env node
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'csc-ts-node-'));
const file = join(dir, 'value.json');
try {
  writeFileSync(file, JSON.stringify({ ok: true }), 'utf8');
  const value = JSON.parse(readFileSync(file, 'utf8')) as { ok?: unknown };
  if (value.ok !== true) throw new Error('ts-node runtime smoke test failed');
  console.log(`✓ Repository TypeScript runs through ts-node on ${process.version}`);
} finally {
  rmSync(dir, { force: true, recursive: true });
}
""", encoding='utf-8')

Path(__file__).unlink()
