import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test/**',
        '**/tests/**'
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 95,
          lines: 90,
          statements: 90
        }
      }
    },
    setupFiles: ['./tests/setup.ts']
  }
})
