#!/usr/bin/env node
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
  const quotes = [`'${name}'`, `"${name}"`];
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
  if (new RegExp(`\\b${oldManager}\\b`, 'i').test(value)) {
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
    [/\burl\.parse\s*\(/, 'url.parse'],
    [/new\s+Buffer\s*\(/, 'new Buffer'],
    [/\bfs\.exists\s*\(/, 'fs.exists'],
    [/actions\/(?:checkout|setup-node)@v[1-5]\b/, 'old Node action runtime'],
    [/actions\/upload-artifact@v[1-5]\b/, 'old upload action runtime'],
    [/actions\/download-artifact@v[1-6]\b/, 'old download action runtime'],
    [/peter-evans\/create-pull-request@v[1-7]\b/, 'old pull-request action runtime'],
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
    throw new Error(`Deprecated commands or dependencies remain:\n${findings.map(item => `- ${item.file}: ${item.issue}`).join('\n')}`);
  }
  console.log('✓ No deprecated commands, APIs or removed dependencies remain');
} catch (error) {
  fail(error);
}
