from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = "2.1.0"
REPO_OLD = "kitty-crow/countrystatecity-npm"
REPO_NEW = "kitty-crow/countrystatecity"


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, content: str) -> None:
    file = ROOT / path
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(content.rstrip() + "\n", encoding="utf-8")


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, value: dict) -> None:
    path.write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")


def replace_repo(value):
    if isinstance(value, str):
        return value.replace(REPO_OLD, REPO_NEW)
    if isinstance(value, list):
        return [replace_repo(item) for item in value]
    if isinstance(value, dict):
        return {key: replace_repo(item) for key, item in value.items()}
    return value


root_file = ROOT / "package.json"
root = load_json(root_file)
root["version"] = VERSION
root["workspaces"] = ["packages/*"]
root["scripts"] = {
    "build": "turbo run build",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "dev": "turbo run dev",
    "fetch-database": "tsx scripts/fetch-database.ts",
    "generate-data": "tsx scripts/generate-all.ts",
    "update-data": "tsx scripts/fetch-database.ts && tsx scripts/generate-all.ts && turbo run build",
    "lint": "turbo run lint",
    "clean": "tsx scripts/clean.ts",
    "typecheck:scripts": "tsc -p scripts/tsconfig.json --noEmit",
    "check:languages": "tsx scripts/check-languages.ts",
    "check:deprecations": "tsx scripts/check-deprecations.ts",
    "check:no-js": "tsx scripts/check-languages.ts",
    "check:api": "tsx scripts/check-api.ts",
    "check:runtime": "tsx scripts/runtime-smoke.ts",
    "check:runtime:ts-node": "ts-node-esm scripts/runtime-smoke.ts",
    "check:runtime:bun": "bun run scripts/runtime-smoke.ts",
    "check": "tsx scripts/check-languages.ts && tsx scripts/check-deprecations.ts && tsc -p scripts/tsconfig.json --noEmit && turbo run typecheck && turbo run build && tsx scripts/check-api.ts && turbo run test",
    "audit": "npm audit --audit-level=low",
    "audit:prod": "npm audit --omit=dev --audit-level=low",
    "test:integration": "tsx scripts/test-integration.ts packages/countries/tests/nextjs-integration packages/countries 'countries with Next.js' && tsx scripts/test-integration.ts packages/countries/tests/vite-integration packages/countries 'countries with Vite' && tsx scripts/test-integration.ts packages/timezones/tests/nextjs-integration packages/timezones 'timezones with Next.js' && tsx scripts/test-integration.ts packages/translations/tests/nextjs-integration packages/translations 'translations with Next.js'",
    "test:integration:countries:next": "tsx scripts/test-integration.ts packages/countries/tests/nextjs-integration packages/countries 'countries with Next.js'",
    "test:integration:countries:vite": "tsx scripts/test-integration.ts packages/countries/tests/vite-integration packages/countries 'countries with Vite'",
    "test:integration:timezones:next": "tsx scripts/test-integration.ts packages/timezones/tests/nextjs-integration packages/timezones 'timezones with Next.js'",
    "test:integration:translations:next": "tsx scripts/test-integration.ts packages/translations/tests/nextjs-integration packages/translations 'translations with Next.js'",
}
root["devDependencies"].update({
    "ts-node": "^10.9.2",
    "tsup": "^8.5.1",
    "tsx": "^4.23.1",
    "turbo": "^2.10.8",
    "typescript": "^5.9.3",
    "vite": "^8.2.0",
    "vitest": "^4.1.10",
})
root["engines"] = {"node": ">=20.19.0", "npm": ">=10", "bun": ">=1.2.0"}
root["packageManager"] = "npm@11.16.0"
root["overrides"] = {
    "brace-expansion": "1.1.17",
    "esbuild": "0.28.1",
    "js-yaml": "4.3.0",
    "postcss": "8.5.18",
}
root = replace_repo(root)
save_json(root_file, root)

for package_file in sorted((ROOT / "packages").glob("*/package.json")):
    pkg = replace_repo(load_json(package_file))
    pkg["version"] = VERSION
    dev = pkg.get("devDependencies", {})
    if "tsup" in dev:
        dev["tsup"] = "^8.5.1"
    if "tsx" in dev:
        dev["tsx"] = "^4.23.1"
    if "typescript" in dev:
        dev["typescript"] = "^5.9.3"
    if "vitest" in dev:
        dev["vitest"] = "^4.1.10"
    dev.pop("ts-node", None)
    pkg["devDependencies"] = dev

    if package_file.parent.name == "cli":
        deps = pkg.get("dependencies", {})
        for name in ["axios", "chalk", "cli-table3", "conf", "open", "ora", "@inquirer/select"]:
            deps.pop(name, None)
        pkg["dependencies"] = deps
        dev["eslint"] = "^10.8.0"
        pkg["scripts"]["prepublishOnly"] = pkg["scripts"]["build"]

    save_json(package_file, pkg)

    changelog = package_file.parent / "CHANGELOG.md"
    if changelog.exists():
        current = changelog.read_text(encoding="utf-8")
        if f"## {VERSION}" not in current:
            first, sep, rest = current.partition("\n")
            entry = (
                f"\n## {VERSION}\n\n### Minor Changes\n\n"
                "- Switched repository development to npm workspaces and native platform APIs.\n"
                "- Removed avoidable CLI runtime dependencies without changing commands or output shapes.\n"
            )
            changelog.write_text(f"{first}{entry}{sep}{rest}".replace("\n\n\n", "\n\n"), encoding="utf-8")

write("packages/cli/src/lib/ansi.ts", r'''
type Paint = (value: string) => string;

const enabled = (): boolean => {
  const force = process.env['FORCE_COLOR'];
  if (force === '0') return false;
  if (force !== undefined) return true;
  if ('NO_COLOR' in process.env) return false;
  if (process.env['TERM'] === 'dumb') return false;
  return Boolean(process.stdout.isTTY || process.stderr.isTTY);
};

const paint = (open: number, close: number): Paint => value =>
  enabled() ? `\u001B[${open}m${value}\u001B[${close}m` : value;

const hex = (colour: string): Paint => {
  const raw = colour.replace(/^#/, '');
  const full = raw.length === 3 ? [...raw].map(char => char + char).join('') : raw;
  if (!/^[0-9a-f]{6}$/i.test(full)) return value => value;
  const red = Number.parseInt(full.slice(0, 2), 16);
  const green = Number.parseInt(full.slice(2, 4), 16);
  const blue = Number.parseInt(full.slice(4, 6), 16);
  return value => enabled() ? `\u001B[38;2;${red};${green};${blue}m${value}\u001B[39m` : value;
};

const chalk = {
  bold: paint(1, 22),
  cyan: paint(36, 39),
  dim: paint(2, 22),
  green: paint(32, 39),
  hex,
  red: paint(31, 39),
  yellow: paint(33, 39),
};

export default chalk;
''')

write("packages/cli/src/lib/browser.ts", r'''
import { spawn } from 'node:child_process';

interface Launch {
  readonly command: string;
  readonly args: readonly string[];
}

const launcher = (url: string): Launch => {
  if (process.platform === 'darwin') return { command: 'open', args: [url] };
  if (process.platform === 'win32') {
    return { command: 'rundll32.exe', args: ['url.dll,FileProtocolHandler', url] };
  }
  return { command: 'xdg-open', args: [url] };
};

/** Opens an HTTP(S) URL with the operating system's default browser. */
export const openUrl = async (url: string): Promise<void> => {
  const parsed = new URL(url);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Unsupported URL protocol: ${parsed.protocol}`);
  }

  const { command, args } = launcher(parsed.toString());
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, [...args], { detached: true, stdio: 'ignore' });
    child.once('error', reject);
    child.once('spawn', () => {
      child.unref();
      resolve();
    });
  });
};
''')

write("packages/cli/src/lib/api.ts", r'''
import chalk from './ansi.ts';
import { getApiBase, getApiKey } from './config.ts';
import { USER_AGENT } from '../version.ts';

export interface UsageInfo {
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
}

interface ApiResponse<T> {
  data: T;
  usage: UsageInfo | null;
}

class HttpError extends Error {
  constructor(readonly status: number, statusText: string) {
    super(statusText ? `HTTP ${status}: ${statusText}` : `HTTP ${status}`);
  }
}

const extractUsage = (headers: Headers): UsageInfo | null => {
  const dailyUsed = headers.get('x-csc-daily-used');
  const dailyLimit = headers.get('x-csc-daily-limit');
  const monthlyUsed = headers.get('x-csc-monthly-used');
  const monthlyLimit = headers.get('x-csc-monthly-limit');
  if (!dailyUsed || !dailyLimit || !monthlyUsed || !monthlyLimit) return null;

  return {
    dailyUsed: Number.parseInt(dailyUsed, 10),
    dailyLimit: Number.parseInt(dailyLimit, 10),
    monthlyUsed: Number.parseInt(monthlyUsed, 10),
    monthlyLimit: Number.parseInt(monthlyLimit, 10),
  };
};

const exit = (message: string, hint?: string): never => {
  console.error(chalk.red(message));
  if (hint) console.error(chalk.dim(hint));
  process.exit(1);
};

const handleError = (error: unknown): never => {
  if (!(error instanceof HttpError)) {
    return exit('Cannot reach API. Check your internet connection.');
  }

  if (error.status === 401) return exit('Invalid or missing API key.', 'Run `csc auth login` to set your key.');
  if (error.status === 403) return exit('Access denied — this endpoint requires a higher plan.', 'Run `csc upgrade` to view available plans.');
  if (error.status === 429) {
    console.error(chalk.red('Daily limit reached.'));
    console.error(chalk.yellow('Run `csc upgrade` to increase your limits.'));
    process.exit(1);
  }
  if (error.status === 404) return exit('Not found.');
  return exit(`API error: ${error.message}`);
};

const request = async <T>(path: string, apiKey: string): Promise<ApiResponse<T>> => {
  const response = await fetch(`${getApiBase()}${path}`, {
    headers: { 'X-CSCAPI-KEY': apiKey, 'User-Agent': USER_AGENT },
  });
  if (!response.ok) throw new HttpError(response.status, response.statusText);
  const data = await response.json() as T;
  return { data, usage: extractUsage(response.headers) };
};

/** Makes an authenticated GET request to the CSC API. */
export const get = async <T>(path: string): Promise<ApiResponse<T>> => {
  const apiKey = getApiKey();
  if (!apiKey) return exit('Not authenticated.', 'Run `csc auth login` to set your API key.');

  try {
    return await request<T>(path, apiKey);
  } catch (error) {
    return handleError(error);
  }
};

/** Validates an API key with a lightweight request. */
export const validateKey = async (apiKey: string): Promise<{ valid: boolean; usage: UsageInfo | null }> => {
  try {
    const response = await fetch(`${getApiBase()}/countries/IN`, {
      headers: { 'X-CSCAPI-KEY': apiKey, 'User-Agent': USER_AGENT },
    });
    if (!response.ok) return { valid: false, usage: null };
    return { valid: true, usage: extractUsage(response.headers) };
  } catch {
    return { valid: false, usage: null };
  }
};
''')

write("packages/cli/src/lib/config.ts", r'''
import { chmodSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

interface Config {
  apiKey?: string;
  apiBase?: string;
}

const defaultBase = 'https://api.countrystatecity.in/v1';

const configDir = (): string => {
  const override = process.env['CSC_CONFIG_DIR'];
  if (override) return resolve(override);
  if (process.platform === 'darwin') return join(homedir(), 'Library', 'Preferences', 'csc-nodejs');
  if (process.platform === 'win32') {
    const appData = process.env['APPDATA'] ?? join(homedir(), 'AppData', 'Roaming');
    return join(appData, 'csc-nodejs', 'Config');
  }
  const base = process.env['XDG_CONFIG_HOME'] ?? join(homedir(), '.config');
  return join(base, 'csc-nodejs');
};

const configFile = (): string => join(configDir(), 'config.json');

const read = (): Config => {
  try {
    const parsed = JSON.parse(readFileSync(configFile(), 'utf8')) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const value = parsed as Record<string, unknown>;
    return {
      apiKey: typeof value['apiKey'] === 'string' ? value['apiKey'] : undefined,
      apiBase: typeof value['apiBase'] === 'string' ? value['apiBase'] : undefined,
    };
  } catch {
    return {};
  }
};

const write = (config: Config): void => {
  const dir = configDir();
  const file = configFile();
  const temp = `${file}.${process.pid}.tmp`;
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  writeFileSync(temp, `${JSON.stringify(config, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  rmSync(file, { force: true });
  renameSync(temp, file);
  if (process.platform !== 'win32') chmodSync(file, 0o600);
};

/** Retrieves the stored API key, or undefined if not set. */
export const getApiKey = (): string | undefined => read().apiKey || undefined;

/** Persists the user's API key to local config. */
export const setApiKey = (key: string): void => {
  const current = read();
  write({ ...current, apiKey: key });
};

/** Removes the stored API key. */
export const clearApiKey = (): void => {
  const current = read();
  delete current.apiKey;
  write(current);
};

/** Returns the API base URL. */
export const getApiBase = (): string => read().apiBase || defaultBase;

/** Returns true if an API key is currently stored. */
export const isAuthenticated = (): boolean => getApiKey() !== undefined;
''')

write("packages/cli/src/lib/display.ts", r'''
import chalk from './ansi.ts';

const ansi = /\u001B\[[0-?]*[ -/]*[@-~]/g;
const strip = (value: string): string => value.replace(ansi, '');

const width = (value: string): number => [...strip(value)].reduce((total, char) => {
  const code = char.codePointAt(0) ?? 0;
  return total + (code >= 0x1100 ? 2 : 1);
}, 0);

const pad = (value: string, size: number): string => value + ' '.repeat(Math.max(0, size - width(value)));

/** Renders a formatted table to stdout. */
export const printTable = (headers: string[], rows: string[][]): void => {
  const count = headers.length;
  const normal = rows.map(row => Array.from({ length: count }, (_, index) => row[index] ?? ''));
  const sizes = headers.map((header, index) => Math.max(
    width(header),
    ...normal.map(row => width(row[index] ?? '')),
  ));
  const border = (left: string, middle: string, right: string): string =>
    left + sizes.map(size => '─'.repeat(size + 2)).join(middle) + right;
  const line = (cells: string[]): string =>
    '│' + cells.map((cell, index) => ` ${pad(cell, sizes[index] ?? 0)} `).join('│') + '│';

  const output = [
    border('┌', '┬', '┐'),
    line(headers.map(header => chalk.cyan(header))),
    border('├', '┼', '┤'),
    ...normal.map(line),
    border('└', '┴', '┘'),
  ];
  console.log(output.join('\n'));
};

/** Pretty-prints a JSON value with syntax highlighting. */
export const printJson = (data: unknown): void => {
  const json = JSON.stringify(data, null, 2);
  const highlighted = json.replace(
    /"([^"]+)"\s*:|:\s*"((?:[^"\\]|\\.)*)"|:\s*(-?\d+(?:\.\d+)?)/g,
    (match, key: string | undefined, strVal: string | undefined, numVal: string | undefined) => {
      if (key !== undefined) return `${chalk.cyan(`"${key}"`)}:`;
      if (strVal !== undefined) return `: ${chalk.green(`"${strVal}"`)}`;
      if (numVal !== undefined) return `: ${chalk.yellow(numVal)}`;
      return match;
    },
  );
  console.log(highlighted);
};

/** Prints a key-value pair with label formatting. */
export const printDetail = (label: string, value: string): void => {
  console.log(`${chalk.bold(label.padEnd(14))}${value}`);
};
''')

write("packages/cli/src/lib/output.ts", r'''
import search from '@inquirer/search';

export interface GlobalFlags {
  json: boolean;
  quiet: boolean;
  noFooter: boolean;
}

export interface Spinner {
  start(text?: string): Spinner;
  stop(): void;
  succeed(text?: string): void;
  fail(text?: string): void;
  text: string;
}

export const stderr = (message: string): void => {
  process.stderr.write(message + '\n');
};

class NativeSpinner implements Spinner {
  private readonly frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private timer: ReturnType<typeof setInterval> | undefined;
  private index = 0;
  private active = false;

  constructor(public text: string) {}

  start(text?: string): Spinner {
    if (text !== undefined) this.text = text;
    if (this.active) return this;
    this.active = true;
    if (!process.stderr.isTTY) {
      stderr(`- ${this.text}`);
      return this;
    }
    this.render();
    this.timer = setInterval(() => {
      this.index = (this.index + 1) % this.frames.length;
      this.render();
    }, 80);
    this.timer.unref();
    return this;
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    if (process.stderr.isTTY) process.stderr.write('\r\u001B[2K');
  }

  succeed(text?: string): void {
    this.stop();
    stderr(`✔ ${text ?? this.text}`);
  }

  fail(text?: string): void {
    this.stop();
    stderr(`✖ ${text ?? this.text}`);
  }

  private render(): void {
    process.stderr.write(`\r\u001B[2K${this.frames[this.index] ?? '⠋'} ${this.text}`);
  }
}

const noopSpinner = (text: string): Spinner => ({
  text,
  start(next?: string): Spinner {
    if (next !== undefined) this.text = next;
    return this;
  },
  stop(): void {},
  succeed(): void {},
  fail(): void {},
});

export const createSpinner = async (text: string, flags: GlobalFlags): Promise<Spinner> => {
  if (flags.quiet || flags.json) return noopSpinner(text);
  return new NativeSpinner(text).start();
};

export const isTTY = (): boolean => Boolean(process.stdin.isTTY);

export const promptCountry = async (
  countries: Array<{ name: string; iso2: string; emoji?: string }>,
): Promise<string> => search<string>({
  message: 'Select a country',
  source: input => {
    const query = (input ?? '').toLowerCase();
    return Promise.resolve(countries
      .filter(country => country.name.toLowerCase().includes(query) || country.iso2.toLowerCase().includes(query))
      .map(country => ({
        name: country.emoji ? `${country.emoji}  ${country.name}` : country.name,
        value: country.iso2,
      })));
  },
});

export const promptState = async (
  states: Array<{ name: string; iso2: string }>,
): Promise<string> => search<string>({
  message: 'Select a state',
  source: input => {
    const query = (input ?? '').toLowerCase();
    return Promise.resolve(states
      .filter(state => state.name.toLowerCase().includes(query) || state.iso2.toLowerCase().includes(query))
      .map(state => ({ name: state.name, value: state.iso2 })));
  },
});
''')

write("scripts/fetch-database.ts", r'''
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
''')

write("scripts/clean.ts", r'''
#!/usr/bin/env node
import { readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const remove = (path: string): void => rmSync(path, { force: true, recursive: true });

for (const name of ['.turbo', 'coverage', 'dist']) remove(join(root, name));
for (const item of readdirSync(join(root, 'packages'), { withFileTypes: true })) {
  if (!item.isDirectory()) continue;
  for (const name of ['.turbo', 'coverage', 'dist', 'node_modules']) {
    remove(join(root, 'packages', item.name, name));
  }
}
remove(join(root, 'node_modules'));
console.log('✓ Removed build, cache and dependency directories');
''')

write("scripts/runtime-smoke.ts", r'''
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
''')

write("scripts/check-deprecations.ts", r'''
#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { dirname } from 'node:path';
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

interface Finding {
  readonly file: string;
  readonly issue: string;
}

const findings: Finding[] = [];

const inspect = (file: string): void => {
  if (file.endsWith('package-lock.json')) return;
  const value = readFileSync(file, 'utf8');
  if (new RegExp(`\\b${oldManager}\\b`, 'i').test(value)) {
    findings.push({ file: relative(root, file), issue: 'removed package-manager command' });
  }
  for (const name of removed) {
    const dependency = new RegExp(`(?:from\\s+|import\\s*\\(|require\\s*\\()?[\\"']${name}[\\"']`);
    const manifest = new RegExp(`\\"${name}\\"\\s*:`);
    if (dependency.test(value) || manifest.test(value)) {
      findings.push({ file: relative(root, file), issue: `removed dependency ${name}` });
    }
  }
  const deprecated: Array<[RegExp, string]> = [
    [/\\burl\\.parse\\s*\\(/, 'url.parse'],
    [/new\\s+Buffer\\s*\\(/, 'new Buffer'],
    [/\\bfs\\.exists\\s*\\(/, 'fs.exists'],
    [/[\\"']punycode[\\"']/, 'punycode'],
    [/::set-output/, 'set-output command'],
    [/::save-state/, 'save-state command'],
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
    throw new Error(`Deprecated commands or dependencies remain:\n${findings.map(item => `- ${item.file}: ${item.issue}`).join('\n')}`);
  }
  console.log('✓ No deprecated commands, APIs or removed dependencies remain');
} catch (error) {
  fail(error);
}
''')

for source in (ROOT / "packages/cli/src").rglob("*.ts"):
    value = source.read_text(encoding="utf-8")
    if "import chalk from 'chalk';" in value:
        target = "./ansi.ts" if source.parent.name == "lib" else "../lib/ansi.ts"
        value = value.replace("import chalk from 'chalk';", f"import chalk from '{target}';")
    value = value.replace("import open from 'open';", "import { openUrl } from '../lib/browser.ts';")
    value = value.replace("await open(", "await openUrl(")
    value = value.replace("from 'readline'", "from 'node:readline'")
    value = value.replace("from 'stream'", "from 'node:stream'")
    source.write_text(value, encoding="utf-8")


def remove_mock(value: str, module: str) -> str:
    markers = [f"vi.mock('{module}'", f'vi.mock("{module}"']
    while True:
        positions = [value.find(marker) for marker in markers if value.find(marker) >= 0]
        if not positions:
            return value
        start = min(positions)
        line_start = value.rfind("\n", 0, start) + 1
        index = value.find("(", start)
        depth = 0
        quote = None
        escaped = False
        line_comment = False
        block_comment = False
        end = None
        while index < len(value):
            char = value[index]
            next_char = value[index + 1] if index + 1 < len(value) else ""
            if line_comment:
                if char == "\n":
                    line_comment = False
                index += 1
                continue
            if block_comment:
                if char == "*" and next_char == "/":
                    block_comment = False
                    index += 2
                    continue
                index += 1
                continue
            if quote:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == quote:
                    quote = None
                index += 1
                continue
            if char in ["'", '"', "`"]:
                quote = char
                index += 1
                continue
            if char == "/" and next_char == "/":
                line_comment = True
                index += 2
                continue
            if char == "/" and next_char == "*":
                block_comment = True
                index += 2
                continue
            if char == "(":
                depth += 1
            elif char == ")":
                depth -= 1
                if depth == 0:
                    end = index + 1
                    while end < len(value) and value[end] in " ;\t":
                        end += 1
                    if end < len(value) and value[end] == "\n":
                        end += 1
                    break
            index += 1
        if end is None:
            raise RuntimeError(f"Cannot remove mock for {module}")
        value = value[:line_start] + value[end:]


for test in (ROOT / "packages/cli/tests").rglob("*.ts"):
    value = test.read_text(encoding="utf-8")
    for module in ["chalk", "ora", "cli-table3"]:
        value = remove_mock(value, module)
    test.write_text(value, encoding="utf-8")

write("packages/cli/tests/lib/api.test.ts", r'''
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/config.ts', () => ({
  getApiKey: vi.fn(() => 'test-api-key'),
  getApiBase: vi.fn(() => 'https://api.countrystatecity.in/v1'),
}));

import { get, validateKey } from '../../src/lib/api.ts';
import { getApiKey } from '../../src/lib/config.ts';

const fetchMock = vi.fn();
const response = (data: unknown, status = 200, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(data), { status, headers });

describe('api client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('makes authenticated GET requests with correct headers', async () => {
    fetchMock.mockResolvedValue(response({ name: 'India' }));
    const result = await get<{ name: string }>('/countries/IN');
    expect(result.data).toEqual({ name: 'India' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.countrystatecity.in/v1/countries/IN',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-CSCAPI-KEY': 'test-api-key' }),
      }),
    );
  });

  it('extracts usage info from response headers', async () => {
    fetchMock.mockResolvedValue(response({}, 200, {
      'x-csc-daily-used': '47',
      'x-csc-daily-limit': '1000',
      'x-csc-monthly-used': '1230',
      'x-csc-monthly-limit': '30000',
    }));
    await expect(get('/countries/IN')).resolves.toMatchObject({
      usage: { dailyUsed: 47, dailyLimit: 1000, monthlyUsed: 1230, monthlyLimit: 30000 },
    });
  });

  it('returns null usage when quota headers are incomplete', async () => {
    fetchMock.mockResolvedValue(response({}, 200, { 'x-csc-daily-used': '47' }));
    await expect(get('/countries/IN')).resolves.toMatchObject({ usage: null });
  });

  for (const status of [401, 429, 404]) {
    it(`exits on ${status} response`, async () => {
      vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
      fetchMock.mockResolvedValue(response({}, status));
      await expect(get('/countries/IN')).rejects.toThrow('exit');
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  }

  it('exits on network error', async () => {
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(get('/countries/IN')).rejects.toThrow('exit');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('exits when no API key is configured', async () => {
    vi.mocked(getApiKey).mockReturnValueOnce(undefined);
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(get('/countries/IN')).rejects.toThrow('exit');
  });

  it('validates a working API key', async () => {
    fetchMock.mockResolvedValue(response({}, 200, {
      'x-csc-daily-used': '10',
      'x-csc-daily-limit': '1000',
      'x-csc-monthly-used': '100',
      'x-csc-monthly-limit': '30000',
    }));
    await expect(validateKey('valid-key')).resolves.toMatchObject({ valid: true });
  });

  it('rejects an invalid API key', async () => {
    fetchMock.mockResolvedValue(response({}, 401));
    await expect(validateKey('invalid-key')).resolves.toEqual({ valid: false, usage: null });
  });
});
''')

write("packages/cli/tests/lib/config.test.ts", r'''
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { clearApiKey, getApiBase, getApiKey, isAuthenticated, setApiKey } from '../../src/lib/config.ts';

let dir = '';

describe('config', () => {
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'csc-config-'));
    process.env['CSC_CONFIG_DIR'] = dir;
  });

  afterEach(() => {
    delete process.env['CSC_CONFIG_DIR'];
    rmSync(dir, { force: true, recursive: true });
  });

  it('returns undefined when no API key is set', () => {
    expect(getApiKey()).toBeUndefined();
  });

  it('stores and retrieves an API key', () => {
    setApiKey('test-key-123');
    expect(getApiKey()).toBe('test-key-123');
  });

  it('clears the API key', () => {
    setApiKey('test-key-123');
    clearApiKey();
    expect(getApiKey()).toBeUndefined();
  });

  it('returns the default API base URL', () => {
    expect(getApiBase()).toBe('https://api.countrystatecity.in/v1');
  });

  it('reports authentication state', () => {
    expect(isAuthenticated()).toBe(false);
    setApiKey('test-key-123');
    expect(isAuthenticated()).toBe(true);
  });
});
''')

write("packages/cli/tests/lib/output.test.ts", r'''
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSpinner, isTTY, stderr } from '../../src/lib/output.ts';
import type { GlobalFlags } from '../../src/lib/output.ts';

const quietFlags: GlobalFlags = { json: false, quiet: true, noFooter: false };
const jsonFlags: GlobalFlags = { json: true, quiet: false, noFooter: false };
const normalFlags: GlobalFlags = { json: false, quiet: false, noFooter: false };

describe('stderr', () => {
  afterEach(() => vi.restoreAllMocks());

  it('writes the message followed by a newline', () => {
    const spy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    stderr('hello world');
    expect(spy).toHaveBeenCalledWith('hello world\n');
  });
});

describe('createSpinner', () => {
  afterEach(() => vi.restoreAllMocks());

  for (const flags of [quietFlags, jsonFlags]) {
    it('returns a silent chainable spinner for structured output', async () => {
      const spinner = await createSpinner('loading…', flags);
      expect(spinner.start()).toBe(spinner);
      spinner.text = 'updated';
      expect(spinner.text).toBe('updated');
      expect(() => spinner.stop()).not.toThrow();
      expect(() => spinner.succeed()).not.toThrow();
      expect(() => spinner.fail()).not.toThrow();
    });
  }

  it('uses a native stderr spinner in normal mode', async () => {
    Object.defineProperty(process.stderr, 'isTTY', { value: false, configurable: true });
    const spy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const spinner = await createSpinner('loading…', normalFlags);
    expect(spinner).toBeDefined();
    expect(spy).toHaveBeenCalledWith('- loading…\n');
  });
});

describe('isTTY', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reflects stdin TTY state', () => {
    Object.defineProperty(process.stdin, 'isTTY', { value: true, configurable: true });
    expect(isTTY()).toBe(true);
    Object.defineProperty(process.stdin, 'isTTY', { value: undefined, configurable: true });
    expect(isTTY()).toBe(false);
  });
});
''')

write("packages/cli/tests/commands/upgrade.test.ts", r'''
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/config.ts', () => ({ getApiKey: vi.fn() }));
vi.mock('../../src/lib/api.ts', () => ({ validateKey: vi.fn() }));
vi.mock('../../src/lib/browser.ts', () => ({ openUrl: vi.fn() }));

import { Command } from 'commander';
import { registerUpgradeCommand } from '../../src/commands/upgrade.ts';
import { validateKey } from '../../src/lib/api.ts';
import { openUrl } from '../../src/lib/browser.ts';
import { getApiKey } from '../../src/lib/config.ts';

describe('upgrade command', () => {
  let program: Command;

  beforeEach(() => {
    vi.clearAllMocks();
    program = new Command();
    program.exitOverride();
    registerUpgradeCommand(program);
  });

  afterEach(() => vi.restoreAllMocks());

  it('shows the current plan when authenticated', async () => {
    vi.mocked(getApiKey).mockReturnValue('test-key');
    vi.mocked(validateKey).mockResolvedValue({
      valid: true,
      usage: { dailyUsed: 10, dailyLimit: 1000, monthlyUsed: 100, monthlyLimit: 30000 },
    });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['node', 'csc', 'upgrade']);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Supporter'));
    expect(openUrl).toHaveBeenCalledWith('https://app.countrystatecity.in/pricing');
  });

  it('shows plans and opens pricing when unauthenticated', async () => {
    vi.mocked(getApiKey).mockReturnValue(undefined);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['node', 'csc', 'upgrade']);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Available plans'));
    expect(openUrl).toHaveBeenCalledWith('https://app.countrystatecity.in/pricing');
  });
});
''')

write("packages/cli/tests/commands/export.test.ts", r'''
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/browser.ts', () => ({ openUrl: vi.fn() }));

import { Command } from 'commander';
import { registerExportCommand } from '../../src/commands/export.ts';
import { openUrl } from '../../src/lib/browser.ts';

describe('export command', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('opens the export tool in the browser', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = new Command();
    program.exitOverride();
    registerExportCommand(program);
    await program.parseAsync(['node', 'csc', 'export']);
    expect(openUrl).toHaveBeenCalledWith('https://export.countrystatecity.in');
  });

  it('outputs JSON without opening a browser', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = new Command();
    program.option('--json');
    program.exitOverride();
    registerExportCommand(program);
    await program.parseAsync(['node', 'csc', '--json', 'export']);
    expect(openUrl).not.toHaveBeenCalled();
  });
});
''')

write("README.md", r'''
# CountryStateCity

Strict TypeScript packages for country, state, city, timezone, currency, translation and phone-code data.

Published ESM, CommonJS, declaration and deep-import entry points remain compatible with the pre-refactor packages.

## Packages

| Package | Purpose |
| --- | --- |
| `@countrystatecity/countries` | Server-side countries, states and cities with lazy data loading |
| `@countrystatecity/countries-browser` | Browser-compatible geographic data from a configurable CDN |
| `@countrystatecity/timezones` | IANA timezone data and conversion utilities |
| `@countrystatecity/currencies` | ISO 4217 currency lookup and formatting |
| `@countrystatecity/translations` | Country-name translations |
| `@countrystatecity/phonecodes` | Country dial-code lookup and formatting |
| `@countrystatecity/cli` | Terminal access to the CountryStateCity API |

## Use

```sh
npm install @countrystatecity/countries
```

```ts
import { getCitiesOfState, getCountries, getStatesOfCountry } from '@countrystatecity/countries';

const countries = await getCountries();
const states = await getStatesOfCountry('GB');
const cities = await getCitiesOfState('GB', 'SCT');
```

```sh
npm install --global @countrystatecity/cli
csc auth login
csc search states --country GB
```

## Develop

npm workspaces are the canonical development environment:

```sh
npm ci
npm run check
npm run audit
```

Repository TypeScript also runs through `ts-node` and Bun. These are compatibility targets, while other workspace-aware package managers may work incidentally.

```sh
npm run check:runtime:ts-node
bun install
bun run check
```

## Documentation

- [Architecture](docs/architecture.md)
- [Compatibility](docs/compatibility.md)
- [Development](docs/development.md)
- [Security and dependencies](docs/security.md)

## Data

Data is generated from [`dr5hn/countries-states-cities-database`](https://github.com/dr5hn/countries-states-cities-database).

## Licence

Code and data licences are retained in the relevant package directories.
''')

write("docs/development.md", r'''
# Development

## Requirements

- Node.js 20.19 or later;
- npm 10 or later;
- Bun 1.2 or later when validating the alternative runtime.

npm workspaces and `package-lock.json` are the canonical repository environment.

## Commands

```sh
npm ci
npm run typecheck
npm run build
npm test
npm run check
npm run audit
```

`npm run check` rejects non-TypeScript maintained source, rejects deprecated commands and removed dependencies, typechecks repository tooling and packages, builds every package, verifies the public compatibility contract and runs all tests.

## TypeScript runners

The repository scripts use standard TypeScript and Node APIs. The default runner is `tsx`, with explicit compatibility checks for `ts-node` and Bun:

```sh
npm run check:runtime
npm run check:runtime:ts-node
bun run scripts/runtime-smoke.ts
```

A full Bun validation can be run with:

```sh
bun install
bun run check
```

## Data updates

```sh
npm run fetch-database
npm run generate-data
npm run check
```

The fetcher uses the platform Fetch API, validates the downloaded database, then writes package data. The scheduled workflow runs the same pipeline and opens a pull request only when generated data changes.

## Adding code

Keep public names unchanged unless a deliberately breaking release has been approved. Prefer small modules, explicit types, native platform APIs and guard clauses. Use short local names where their meaning remains clear. Do not commit generated JavaScript.
''')

write("docs/security.md", r'''
# Security and dependencies

The repository treats a clean npm audit as a release condition.

```sh
npm run audit
npm run audit:prod
```

Both the complete development graph and the production graph must report zero low, moderate, high and critical vulnerabilities. CI also fails on install-time deprecation warnings.

The CLI prefers native platform capabilities where they provide the required behaviour:

- Fetch API for HTTP requests;
- filesystem, path and operating-system APIs for configuration;
- child processes for opening browser URLs without a shell;
- ANSI terminal sequences for colour;
- an internal stderr spinner;
- native table formatting.

External runtime dependencies remain only where they provide substantial command parsing or interactive selection behaviour that would be unsafe or wasteful to reproduce locally.
''')

for doc in [ROOT / "docs/architecture.md", ROOT / "docs/compatibility.md"]:
    if doc.exists():
        value = doc.read_text(encoding="utf-8").replace(REPO_OLD, REPO_NEW)
        heading = "## Runtime and dependency policy"
        if heading not in value:
            value = value.rstrip() + (
                f"\n\n{heading}\n\n"
                "npm workspaces are canonical. Repository TypeScript is also validated through `ts-node` and Bun. "
                "CLI networking, configuration, terminal presentation and browser launching use native platform APIs; "
                "public commands, arguments, output shapes and package entry points remain unchanged.\n"
            )
        doc.write_text(value, encoding="utf-8")

replacements = [
    ("pnpm add --global", "npm install --global"),
    ("pnpm add", "npm install"),
    ("pnpm install --frozen-lockfile", "npm ci"),
    ("pnpm install", "npm install"),
    ("pnpm fetch-database", "npm run fetch-database"),
    ("pnpm generate-data", "npm run generate-data"),
    ("pnpm typecheck", "npm run typecheck"),
    ("pnpm build", "npm run build"),
    ("pnpm test", "npm test"),
    ("pnpm check", "npm run check"),
    ("pnpm exec tsx ", "npm exec tsx -- "),
]
for file in ROOT.rglob("*.md"):
    if any(part in {".git", "node_modules"} for part in file.parts):
        continue
    value = file.read_text(encoding="utf-8").replace(REPO_OLD, REPO_NEW)
    for old, new in replacements:
        value = value.replace(old, new)
    file.write_text(value, encoding="utf-8")

ci_file = ROOT / ".github/workflows/ci.yml"
ci = ci_file.read_text(encoding="utf-8")
ci = re.sub(r"\n\s*- uses: pnpm/action-setup@v4\s*\n", "\n", ci)
for old, new in [
    ("actions/checkout@v4", "actions/checkout@v6"),
    ("actions/setup-node@v4", "actions/setup-node@v6"),
    ("actions/upload-artifact@v4", "actions/upload-artifact@v6"),
    ("actions/download-artifact@v4", "actions/download-artifact@v7"),
    ("peter-evans/create-pull-request@v6", "peter-evans/create-pull-request@v8"),
    ("node-version: '20'", "node-version: '24'"),
    ("cache: pnpm", "cache: npm\n          cache-dependency-path: package-lock.json"),
    ("pnpm install --frozen-lockfile", "npm ci"),
    ("pnpm fetch-database", "npm run fetch-database"),
    ("pnpm generate-data", "npm run generate-data"),
    ("pnpm check:no-js", "npm run check:languages"),
    ("pnpm typecheck:scripts", "npm run typecheck:scripts"),
    ("pnpm turbo run typecheck", "npm run typecheck"),
    ("pnpm turbo run build", "npm run build"),
    ("pnpm check:api", "npm run check:api"),
    ("pnpm turbo run test", "npm test"),
]:
    ci = ci.replace(old, new)
ci_file.write_text(ci, encoding="utf-8")

write(".github/workflows/release.yml", r'''
name: Release

on:
  pull_request:
    types: [closed]
    branches: [main]
  workflow_dispatch:

jobs:
  release:
    name: Bump versions and changelogs
    if: >-
      github.event_name == 'workflow_dispatch' ||
      (github.event.pull_request.merged == true &&
       contains(github.event.pull_request.labels.*.name, 'data-update'))
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}
      - uses: actions/setup-node@v6
        with:
          node-version: '24'
          cache: npm
          cache-dependency-path: package-lock.json
      - run: npm ci
      - name: Bump versions and changelogs
        run: npm exec tsx -- scripts/release-data.ts
      - name: Refresh npm lockfile
        run: npm install --package-lock-only --ignore-scripts
      - name: Commit and push
        run: npm exec tsx -- scripts/commit-release.ts
''')

write(".github/workflows/dependency-audit.yml", r'''
name: Dependency and deprecation audit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  npm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '24'
          cache: npm
          cache-dependency-path: package-lock.json
      - name: Install without deprecation warnings
        run: |
          set -o pipefail
          npm ci 2>&1 | tee /tmp/npm-ci.log
          if grep -Ei 'npm warn deprecated|DeprecationWarning' /tmp/npm-ci.log; then
            echo 'Deprecated dependencies or runtime APIs were reported.' >&2
            exit 1
          fi
      - run: npm audit --audit-level=low
      - run: npm audit --omit=dev --audit-level=low
      - run: npm run check:deprecations
      - run: npm run check:runtime:ts-node

  bun:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --no-save
      - run: bun run check:runtime:bun
      - run: bun run check
''')

turbo_file = ROOT / "turbo.json"
turbo = load_json(turbo_file)
turbo["tasks"]["test"] = {"dependsOn": ["build"], "cache": False}
save_json(turbo_file, turbo)

for obsolete in [ROOT / "pnpm-lock.yaml", ROOT / "pnpm-workspace.yaml"]:
    obsolete.unlink(missing_ok=True)

for file in [ROOT / ".gitignore", ROOT / ".npmignore"]:
    if file.exists():
        lines = [line for line in file.read_text(encoding="utf-8").splitlines() if "pnpm" not in line.lower()]
        file.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")

# The migration runner and workflow are temporary and must never enter the final commit.
(ROOT / ".github/migrate.py").unlink(missing_ok=True)
(ROOT / ".github/workflows/apply-native-npm-migration.yml").unlink(missing_ok=True)
