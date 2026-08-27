import { copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import preact from '@preact/preset-vite';
import { defineConfig } from 'vitest/config';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDirectory = resolve(projectRoot, '../../dist');

export default defineConfig({
  base: './',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src'),
    },
  },
  build: {
    outDir: outputDirectory,
    emptyOutDir: true,
    target: 'es2022',
    rollupOptions: {
      input: {
        background: resolve(projectRoot, 'src/entrypoints/background/index.ts'),
        popup: resolve(projectRoot, 'src/entrypoints/popup/index.html'),
        options: resolve(projectRoot, 'src/entrypoints/options/index.html'),
        blocked: resolve(projectRoot, 'src/entrypoints/blocked/index.html'),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === 'background' ? 'background.js' : 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  plugins: [
    preact(),
    {
      name: 'copy-extension-manifest',
      apply: 'build',
      async closeBundle() {
        await copyFile(
          resolve(projectRoot, 'manifest.json'),
          resolve(outputDirectory, 'manifest.json'),
        );
      },
    },
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
});
