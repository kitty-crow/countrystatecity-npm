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

The fetcher uses the platform Fetch API, validates the downloaded database, then writes generated datasets below `src/<package>/data`. The scheduled workflow runs the same pipeline and opens a pull request only when generated data changes.

## Adding code

Place maintained implementation in `src/<package>/`; keep `packages/<package>/` limited to its manifest, build configuration, tests and package documentation.

Keep public names unchanged unless a deliberately breaking release has been approved. Prefer small modules, explicit types, native platform APIs and guard clauses. Use short local names where their meaning remains clear. Do not commit generated JavaScript.
