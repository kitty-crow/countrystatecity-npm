# Architecture

The repository uses npm workspaces and Turborepo. All maintained implementation and generated datasets live under one root `src/` tree. `packages/` contains only the stable npm package surfaces, tests, build configuration and package documentation.

```text
source database
    -> typed validation
    -> src/<package>/scripts generators
    -> src/<package>/data datasets
    -> src/<package> strict TypeScript implementation
    -> packages/<package>/dist ESM, CommonJS and declarations
```

## Source tree

Each package implementation is isolated below `src/<package>/`:

- `index.ts` defines public exports;
- `data.ts` owns typed data access and caching;
- `loaders.ts` exposes public loading operations;
- `utils.ts` contains derived operations;
- `types.ts` contains public and internal types;
- `scripts/generate-data.ts` generates that package's dataset;
- `data/` contains generated source data where applicable.

The CLI follows the same rule under `src/cli/`, divided into commands, platform helpers and templates.

## Package shells

`packages/<package>/package.json` retains every published package name and every `main`, `module`, `types`, `exports`, data and executable path. Package-local build configuration compiles the matching root source directory back into `packages/<package>/dist`, so replacing the former repository or publishing its packages requires no consumer changes.

Tests remain beside each package because they verify that package's public boundary, but they import the implementation from root `src/`.

## Public boundary

Public names are descriptive and stable. Short names are used only for local implementation details. The compatibility gate compares runtime exports, declaration shapes and manifest entry points against the pre-refactor baseline.

## Runtime and dependency policy

npm workspaces are canonical. Repository TypeScript is also validated through `ts-node` and Bun. CLI networking, configuration, terminal presentation and browser launching use native platform APIs; public commands, arguments, output shapes and package entry points remain unchanged.
