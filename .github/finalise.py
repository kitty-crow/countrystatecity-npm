from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]

publish = (root / '.github/workflows/publish.yml').read_text(encoding='utf-8')
publish = re.sub(r'\n\s*- uses: pnpm/action-setup@v4\s*\n', '\n', publish)
for old, new in [
    ('actions/checkout@v4', 'actions/checkout@v6'),
    ('actions/setup-node@v4', 'actions/setup-node@v6'),
    ("node-version: '20'", "node-version: '24'"),
    ('cache: pnpm', 'cache: npm\n          cache-dependency-path: package-lock.json'),
    ('pnpm install --frozen-lockfile', 'npm ci'),
    ('pnpm turbo run build', 'npm run build'),
    ('pnpm publish --no-git-checks --access public', 'npm publish --access public'),
]:
    publish = publish.replace(old, new)
(root / '.github/workflows/publish.yml').write_text(publish, encoding='utf-8')

architecture = root / 'docs/architecture.md'
value = architecture.read_text(encoding='utf-8')
value = value.replace(
    'The repository is a pnpm and Turborepo workspace.',
    'The repository uses npm workspaces and Turborepo.',
)
architecture.write_text(value, encoding='utf-8')

test_integration = root / 'scripts/test-integration.ts'
value = test_integration.read_text(encoding='utf-8').replace(
    'is not built; run pnpm build first',
    'is not built; run npm run build first',
)
test_integration.write_text(value, encoding='utf-8')

(root / 'scripts/generate-all.ts').write_text("""#!/usr/bin/env node
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail } from './lib/args.ts';
import { exists } from './lib/fs.ts';
import { run, runAll, type Job } from './lib/proc.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'data', 'source.json');
const node = process.versions['bun'] ? [process.execPath] : [process.execPath, '--import', 'tsx'];

const job = (name: string, arg = src): Job => ({
  name,
  cwd: join(root, 'packages', name),
  cmd: [...node, 'scripts/generate-data.ts', arg],
});

const main = async (): Promise<void> => {
  if (!exists(src)) throw new Error('data/source.json not found. Run: npm run fetch-database');
  console.log('🚀 Generating data for all packages...');
  console.log(`   Source: ${src}\\n`);
  console.log('── Batch 1: source database packages ──');
  await runAll([
    job('countries'),
    job('timezones'),
    job('currencies'),
    job('translations'),
    job('phonecodes'),
  ]);
  const countryData = join(root, 'packages', 'countries', 'src', 'data');
  if (!exists(countryData)) throw new Error('countries data was not generated');
  console.log('\\n── Batch 2: browser data ──');
  await run(job('countries-browser', countryData));
  console.log('\\n✅ All packages updated successfully.');
  console.log('   Run: npm run build\\n');
};

main().catch(fail);
""", encoding='utf-8')

(root / 'scripts/check-deprecations.ts').write_text("""#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail } from './lib/args.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skip = new Set(['.git', 'compat', 'coverage', 'data', 'dist', 'node_modules', '.turbo']);
const text = new Set(['.cts', '.json', '.md', '.mts', '.ts', '.tsx', '.yaml', '.yml']);
const oldManager = ['pn', 'pm'].join('');
const removed = [
  ['axi', 'os'].join(''),
  ['cha', 'lk'].join(''),
  ['cli-table', '3'].join(''),
  ['co', 'nf'].join(''),
  ['op', 'en'].join(''),
  ['o', 'ra'].join(''),
];
const legacyModule = ['puny', 'code'].join('');
const legacyOutput = ['::set', '-output'].join('');
const legacyState = ['::save', '-state'].join('');

interface Finding {
  readonly file: string;
  readonly issue: string;
}

const findings: Finding[] = [];

const hasDependency = (value: string, name: string): boolean => {
  const quotes = [`'${name}'`, `\"${name}\"`];
  return quotes.some(quoted =>
    value.includes(`from ${quoted}`) ||
    value.includes(`import(${quoted}`) ||
    value.includes(`require(${quoted}`) ||
    value.includes(`${quoted}:`),
  );
};

const inspect = (file: string): void => {
  if (file.endsWith('package-lock.json')) return;
  const value = readFileSync(file, 'utf8');
  if (new RegExp(`\\\\b${oldManager}\\\\b`, 'i').test(value)) {
    findings.push({ file: relative(root, file), issue: 'removed package-manager command' });
  }
  for (const name of removed) {
    if (hasDependency(value, name)) {
      findings.push({ file: relative(root, file), issue: `removed dependency ${name}` });
    }
  }
  if (hasDependency(value, legacyModule)) {
    findings.push({ file: relative(root, file), issue: 'deprecated built-in module' });
  }
  if (value.includes(legacyOutput)) {
    findings.push({ file: relative(root, file), issue: 'legacy workflow output command' });
  }
  if (value.includes(legacyState)) {
    findings.push({ file: relative(root, file), issue: 'legacy workflow state command' });
  }
  const deprecated: Array<[RegExp, string]> = [
    [/\\burl\\.parse\\s*\\(/, 'url.parse'],
    [/new\\s+Buffer\\s*\\(/, 'new Buffer'],
    [/\\bfs\\.exists\\s*\\(/, 'fs.exists'],
    [/actions\\/(?:checkout|setup-node)@v[1-5]\\b/, 'old Node action runtime'],
    [/actions\\/upload-artifact@v[1-5]\\b/, 'old upload action runtime'],
    [/actions\\/download-artifact@v[1-6]\\b/, 'old download action runtime'],
    [/peter-evans\\/create-pull-request@v[1-7]\\b/, 'old pull-request action runtime'],
  ];
  for (const [pattern, issue] of deprecated) {
    if (pattern.test(value)) findings.push({ file: relative(root, file), issue });
  }
};

const scan = (dir: string): void => {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (item.isDirectory() && skip.has(item.name)) continue;
    const file = join(dir, item.name);
    if (item.isDirectory()) scan(file);
    else if (text.has(extname(item.name)) || item.name === 'package.json') inspect(file);
  }
};

try {
  scan(root);
  if (findings.length > 0) {
    throw new Error(`Deprecated commands or dependencies remain:\\n${findings.map(item => `- ${item.file}: ${item.issue}`).join('\\n')}`);
  }
  console.log('✓ No deprecated commands, APIs or removed dependencies remain');
} catch (error) {
  fail(error);
}
""", encoding='utf-8')

Path(__file__).unlink()
