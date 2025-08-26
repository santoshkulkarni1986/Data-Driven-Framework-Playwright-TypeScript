import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: 'playwright-report',
        title: 'Rashmi Automation Report',
      },
    ],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['@estruyf/github-actions-reporter'],

    [
      'monocart-reporter',
      {
        name: 'Playwright Custom Report',
        outputFile: './FinalReports/monocart-report/index.html',
      },
    ],
  ],
  timeout: 120 * 1000, // 2 minutes max per test
  use: {
    trace: 'on', // collect trace for debugging
    screenshot: 'on', // take screenshot on failure
    video: 'on', // record video
    viewport: { width: 1280, height: 720 },
    actionTimeout: 30 * 1000, // 30 seconds for actions
    navigationTimeout: 60 * 1000, // 60 seconds for page.goto/navigation
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
  ],
});
