# Architecture

The repository is a pnpm and Turborepo workspace. Each published package owns one public entry module and a small set of internal responsibilities.

```text
source database
    -> typed validation
    -> package-specific TypeScript generators
    -> split JSON datasets
    -> strict TypeScript loaders and utilities
    -> ESM, CommonJS and declaration builds
```

## Boundaries

`packages/countries` loads local server data. `packages/countries-browser` mirrors its public lookup API but obtains data through `fetch`. The timezone, currency, translation and phone-code packages own independent datasets and indexes. The CLI depends on the remote API rather than the bundled package data.

Each package separates:

- public exports in `src/index.ts`;
- typed data access and caching in `src/data.ts`;
- public loading operations in `src/loaders.ts`;
- derived operations in `src/utils.ts`;
- generation in `scripts/generate-data.ts`.

Shared repository tooling lives under `scripts/`. It validates the upstream database before any package generator receives it.

## Public boundary

Public names are intentionally descriptive and stable. Short names are used only for local implementation details. Package manifests retain the original ESM, CommonJS, declaration and data export paths.
