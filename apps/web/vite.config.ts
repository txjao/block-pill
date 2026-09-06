import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src'),
      '@workspace': resolve(projectRoot, '../..'),
    },
  },
  plugins: [react()],
});
