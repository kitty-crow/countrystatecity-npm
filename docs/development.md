# Development

## Requirements

- Node.js 20 or later;
- pnpm 9 or later.

## Commands

```sh
pnpm install
pnpm typecheck
pnpm build
pnpm test
pnpm check
```

`pnpm check` is the release gate. It also typechecks repository scripts, rejects JavaScript source files and verifies the public compatibility contract.

## Data updates

```sh
pnpm fetch-database
pnpm generate-data
pnpm check
```

The fetcher validates the downloaded database before writing package data. Generators run independently, then the browser package is generated from the server package's split dataset.

The scheduled GitHub workflow performs the same pipeline and opens a data-update pull request only when generated data changes.

## Adding code

Keep public names unchanged unless a deliberately breaking release has been approved. Prefer small modules, explicit types and guard clauses. Use short local names where their meaning remains clear. Do not add generated JavaScript to the repository.
