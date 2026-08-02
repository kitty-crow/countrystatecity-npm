# Security and dependencies

The repository treats a clean npm audit as a release condition.

```sh
npm run audit
npm run audit:prod
```

Both the complete development graph and the production graph must report zero low, moderate, high and critical vulnerabilities. CI also fails on install-time deprecation warnings and deprecated runtime APIs.

Dependency install scripts are denied unless they are explicitly reviewed and pinned in the root `allowScripts` policy. The repository currently permits only the exact `esbuild` version selected by the lockfile and overrides. Project-level npm configuration enables strict enforcement, so a new or changed dependency install script fails `npm ci` instead of running without review.

The CLI prefers native platform capabilities where they provide the required behaviour:

- Fetch API for HTTP requests;
- filesystem, path and operating-system APIs for configuration;
- child processes for opening browser URLs without a shell;
- ANSI terminal sequences for colour;
- an internal stderr spinner;
- native table formatting.

External runtime dependencies remain only where they provide substantial command parsing or interactive selection behaviour that would be unsafe or wasteful to reproduce locally.
