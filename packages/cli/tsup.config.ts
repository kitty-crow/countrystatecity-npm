import { defineConfig } from 'tsup';
import { baseConfig } from '../../tsup.config.base.ts';

export default defineConfig({
  ...baseConfig,
  entry: { index: '../../src/cli/index.ts' },
  format: ['esm'],
  bundle: true,
});
