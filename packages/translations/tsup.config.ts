import { defineConfig } from 'tsup';
import { baseConfig, copyDir } from '../../tsup.config.base.ts';

const src = '../../src/translations';

export default defineConfig({
  ...baseConfig,
  entry: { index: `${src}/index.ts` },
  esbuildOptions(options) {
    options.external = ['./data/*'];
  },
  onSuccess: async () => {
    copyDir(`${src}/data`, 'dist/data');
    console.log('✓ Copied data files to dist/data/');
  },
});
