import { defineConfig } from 'tsup';
import { baseConfig, copyDir } from '../../tsup.config.base.ts';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts'],
  bundle: true,
  esbuildOptions(options) {
    options.external = ['./data/*'];
  },
  onSuccess: async () => {
    copyDir('src/data', 'dist/data');
    console.log('✓ Data files copied to dist/data');
  },
});
