import { readFileSync } from 'node:fs';
import { defineConfig } from 'tsup';
import { baseConfig, copyDir } from '../../tsup.config.base.ts';

interface Pkg {
  readonly version: string;
}

const pkg = JSON.parse(readFileSync('./package.json', 'utf8')) as Pkg;
const src = '../../src/countries-browser';

export default defineConfig({
  ...baseConfig,
  entry: { index: `${src}/index.ts` },
  bundle: true,
  define: { __VERSION__: JSON.stringify(pkg.version) },
  onSuccess: async () => {
    try {
      copyDir(`${src}/data`, 'dist/data');
      console.log('✓ Data files copied to dist/data');
    } catch {
      console.log('⚠ No source data directory found (data not yet generated)');
    }
  },
});
