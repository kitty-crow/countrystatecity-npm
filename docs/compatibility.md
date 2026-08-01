# Compatibility contract

The strict-TypeScript refactor is a drop-in replacement for the preceding release.

The following remain stable:

- npm package names;
- package `main`, `module`, `types` and `exports` paths;
- ESM and CommonJS support;
- the `csc` executable name;
- exported functions, classes and types;
- argument order, return types and data shapes;
- CLI commands, options and output behaviour;
- generated data layout and field order.

`compat/baseline/` contains the declaration files emitted by the pre-refactor build. `pnpm check:api` compares those declarations with the current build and checks the runtime export sets and manifest entry points for both module systems.

The data generators are also parity-tested against the former generators using the same fixture. Their output must be byte-for-byte identical.
