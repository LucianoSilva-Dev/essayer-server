import { config } from 'dotenv';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

config({ path: path.resolve(__dirname, '.env.test'), override: true });

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.e2e.spec.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@common': path.resolve(__dirname, 'src/common'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@config': path.resolve(__dirname, 'src/config'),
    },
  },
  plugins: [
    tsconfigPaths(),
    swc.vite({
      module: {
        type: 'es6',
      },
    }),
  ],
});
