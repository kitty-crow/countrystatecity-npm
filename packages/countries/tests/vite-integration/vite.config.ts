import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const entry = fileURLToPath(new URL('./src/main.ts', import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry,
      formats: ['es'],
      fileName: 'index',
    },
  },
});
