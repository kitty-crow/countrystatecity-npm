# Contributing

Keep changes focused, strictly typed and compatible with the published package APIs.

## Set up

```sh
npm ci
npm run check
npm run audit
```

The complete check must pass before a pull request is opened. Repository tooling must remain TypeScript-only and must also run through the supported `ts-node` and Bun paths.

```sh
npm run check:runtime:ts-node
bun install
bun run check
```

## Compatibility

Do not change public package names, exports, deep imports, declaration shapes, ESM or CommonJS entry points, CLI commands, argument order or return shapes without an intentional compatibility decision.

## Data

Generated data comes from [`dr5hn/countries-states-cities-database`](https://github.com/dr5hn/countries-states-cities-database). Report data corrections upstream first, then regenerate the package data.

## Licences

Code contributions are accepted under the MIT licence. Data and adaptations of the database remain under ODbL-1.0 and must retain source attribution.
