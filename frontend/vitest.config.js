import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./src/vitest/setupTests.js'],
    testTimeout: 10000,
  },
});
