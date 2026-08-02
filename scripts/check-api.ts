#!/usr/bin/env node
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import ts from 'typescript';
import { fail } from './lib/args.ts';

type MapOf<T> = Record<string, T>;
interface EntryPoint {
  readonly main?: string;
  readonly module?: string;
  readonly types?: string;
  readonly import?: string;
  readonly require?: string;
  readonly importTypes?: string;
  readonly requireTypes?: string;
  readonly data?: string;
  readonly bin?: string;
}
interface Manifest {
  readonly main?: string;
  readonly module?: string;
  readonly types?: string;
  readonly bin?: Record<string, string>;
  readonly exports?: {
    readonly '.': {
      readonly import: { readonly types: string; readonly default: string };
      readonly require: { readonly types: string; readonly default: string };
    };
    readonly './data/*'?: string;
  };
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = <T>(file: string): T => JSON.parse(readFileSync(file, 'utf8')) as T;
const expectedExports = read<MapOf<string[]>>(join(root, 'compat', 'public-api.json'));
const expectedEntries = read<MapOf<EntryPoint>>(join(root, 'compat', 'entry-points.json'));
const req = createRequire(import.meta.url);
const printer = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed });

const eq = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const assert = (ok: boolean, message: string): void => {
  if (!ok) throw new Error(message);
};

const declarationMap = (file: string): MapOf<string> => {
  const text = readFileSync(file, 'utf8');
  const src = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const named = new Map<string, ts.Node[]>();
  let exports: ts.NamedExports | undefined;

  for (const stmt of src.statements) {
    if (ts.isExportDeclaration(stmt) && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
      exports = stmt.exportClause;
      continue;
    }
    const name = (ts.isInterfaceDeclaration(stmt)
      || ts.isTypeAliasDeclaration(stmt)
      || ts.isClassDeclaration(stmt)
      || ts.isFunctionDeclaration(stmt)
      || ts.isEnumDeclaration(stmt)
      || ts.isVariableStatement(stmt))
      ? (ts.isVariableStatement(stmt)
          ? stmt.declarationList.declarations[0]?.name
          : stmt.name)
      : undefined;
    if (!name || !ts.isIdentifier(name)) continue;
    const key = name.text;
    const list = named.get(key) ?? [];
    list.push(stmt);
    named.set(key, list);
  }
  if (!exports) throw new Error(`${file} has no named export declaration`);

  const out: MapOf<string> = {};
  for (const item of exports.elements) {
    const exported = item.name.text;
    const local = item.propertyName?.text ?? exported;
    const nodes = named.get(local);
    if (!nodes?.length) throw new Error(`${file} exports ${exported} from missing declaration ${local}`);
    out[exported] = nodes.map(node => printer.printNode(ts.EmitHint.Unspecified, node, src).trim()).join('\n');
  }
  return out;
};

const checkEntries = (pkg: string, expected: EntryPoint): void => {
  const manifest = read<Manifest>(join(root, 'packages', pkg, 'package.json'));
  if (expected.bin) {
    assert(manifest.bin?.['csc'] === expected.bin, `${pkg}: CLI entry point changed`);
    return;
  }
  const exp = manifest.exports?.['.'];
  assert(manifest.main === expected.main, `${pkg}: main entry point changed`);
  assert(manifest.module === expected.module, `${pkg}: module entry point changed`);
  assert(manifest.types === expected.types, `${pkg}: types entry point changed`);
  assert(exp?.import.default === expected.import, `${pkg}: ESM export path changed`);
  assert(exp?.require.default === expected.require, `${pkg}: CommonJS export path changed`);
  assert(exp?.import.types === expected.importTypes, `${pkg}: ESM declaration path changed`);
  assert(exp?.require.types === expected.requireTypes, `${pkg}: CommonJS declaration path changed`);
  assert(manifest.exports?.['./data/*'] === expected.data, `${pkg}: data export path changed`);
};

const checkPackage = async (pkg: string, expected: string[]): Promise<void> => {
  const dir = join(root, 'packages', pkg, 'dist');
  const esm = Object.keys(await import(pathToFileURL(join(dir, 'index.js')).href)).sort();
  const cjs = Object.keys(req(join(dir, 'index.cjs')) as object).sort();
  const names = [...expected].sort();
  assert(eq(esm, names), `${pkg}: ESM exports changed\nexpected ${names.join(', ')}\nreceived ${esm.join(', ')}`);
  assert(eq(cjs, names), `${pkg}: CommonJS exports changed\nexpected ${names.join(', ')}\nreceived ${cjs.join(', ')}`);

  const oldDecl = declarationMap(join(root, 'compat', 'baseline', `${pkg}.d.ts`));
  const newDecl = declarationMap(join(dir, 'index.d.ts'));
  const oldNames = Object.keys(oldDecl).sort();
  const newNames = Object.keys(newDecl).sort();
  assert(eq(oldNames, newNames), `${pkg}: type exports changed\nexpected ${oldNames.join(', ')}\nreceived ${newNames.join(', ')}`);
  for (const name of oldNames) {
    assert(oldDecl[name] === newDecl[name], `${pkg}: public declaration changed for ${name}`);
  }
};

const main = async (): Promise<void> => {
  for (const [pkg, entry] of Object.entries(expectedEntries)) checkEntries(pkg, entry);
  for (const [pkg, names] of Object.entries(expectedExports)) await checkPackage(pkg, names);
  console.log('✓ Public entry points, runtime exports and declarations match the pre-refactor release');
};

main().catch(fail);
