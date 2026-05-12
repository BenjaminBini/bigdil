import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // shared DB — one test at a time keeps state predictable
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.E2E_NO_SERVER
    ? undefined
    : [
        {
          command: 'pnpm --filter @bigdil/api dev',
          url: `${API_URL}/health`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
        {
          command: 'pnpm --filter web dev',
          url: BASE_URL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      ],
})
