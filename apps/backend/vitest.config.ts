import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: ['./src/test/global-setup.ts'],
    setupFiles: ['./src/test/vitest-setup.ts'],
    exclude: ['node_modules', 'dist'],
    fileParallelism: false, // Run test files sequentially to avoid database conflicts
    coverage: {
      provider: 'v8', // Use V8 coverage (built into Node.js)
      reporter: ['text', 'html', 'lcov'], // Generate multiple report formats
      exclude: [
        'node_modules/**',
        'dist/**',
        'src/__tests__/**',
        'src/test/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        'src/**/*.d.ts',
        'vitest.config.ts',
        'src/index.ts', // Entry point
        'src/app.ts', // Main app file
      ],
      include: [
        'src/**/*.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      reportsDirectory: './coverage',
    },
  },
})