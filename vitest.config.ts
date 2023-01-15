// vitest.config.js
import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'vitest/config';

import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    dir: './',
    globals: true,
    environment: 'jsdom',
    globalSetup: './src/setupTestGlobal.ts',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'istanbul',
      all: true,
      reporter: ['text', 'json', 'html'],
      include: ['src/pages/**', 'src/pageComponents/**', 'src/utils/**', 'src/core'],
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10
    }
  }
});
