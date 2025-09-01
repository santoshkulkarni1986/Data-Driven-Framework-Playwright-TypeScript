import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { getEnv } from './src/helper/env/env';

// Load environment variables
getEnv();

// Ensure report folders exist
const reportFolders = [
  'FinalReports/playwright-report',
  'FinalReports/reports/pdf',
  'FinalReports/monocart-report',
  'FinalReports/test-results',
];

reportFolders.forEach((folder) => {
  const folderPath = path.resolve(folder);
  fs.mkdirSync(folderPath, { recursive: true });
  console.log(`Ensured folder exists: ${folderPath}`);
});

export default defineConfig({
  // Global setup (ensure it points to compiled JS or TS as needed)
  globalSetup: path.resolve(__dirname, './dist/setup/global-setup.js'),

  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 4 : 4,
  workers: process.env.CI ? 4 : 4,

  // Adjusted timeouts for long-running tests
  timeout: 30 * 60 * 1000, // 30 min per test
  globalTimeout: 60 * 60 * 1000, // 1 hour for all tests
  expect: { timeout: 10 * 1000 },

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'FinalReports/playwright-report' }],
    ['junit', { outputFile: 'FinalReports/test-results/results.xml' }],
    ['@estruyf/github-actions-reporter'],
    [
      './dist/Utility/pdfReporter.js',
      { outputFile: 'FinalReports/reports/pdf/playwright-Custom-report.pdf' },
    ],
    ['monocart-reporter', { outputFile: './FinalReports/monocart-report/index.html' }],
    ['json', { outputFile: 'FinalReports/test-results/results.json' }],
  ],

  use: {
    baseURL: process.env.AMSUITEBASEURL || 'https://default-url.com',
    navigationTimeout: 60 * 1000,
    actionTimeout: 30 * 1000,
    ignoreHTTPSErrors: true,

    // Artifacts: keep only on failure to save space
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        storageState: fs.existsSync('storageState-chromium.json')
          ? path.resolve('storageState-chromium.json')
          : undefined,
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        headless: true,
        storageState: fs.existsSync('storageState-firefox.json')
          ? path.resolve('storageState-firefox.json')
          : undefined,
      },
    },
  ],
});
