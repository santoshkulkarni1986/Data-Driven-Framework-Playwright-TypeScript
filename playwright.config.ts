import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { getEnv } from './src/helper/env/env';

// ✅ Load environment variables
getEnv();

// ✅ Ensure report folders exist
const reportFolders = [
  'FinalReports/playwright-report',
  'FinalReports/reports/pdf',
  'FinalReports/monocart-report',
  'FinalReports/test-results',
];

reportFolders.forEach((folder) => {
  const folderPath = path.resolve(folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Created folder: ${folderPath}`);
  }
});

export default defineConfig({
  globalSetup: path.resolve(__dirname, './dist/setup/global-setup.js'),

  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 4 : 4,
  workers: process.env.CI ? 4 : 4,
  timeout: 40 * 1000,
  expect: { timeout: 5000 },
  globalTimeout: 10 * 60 * 1000,

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
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        storageState: path.resolve('storageState-chromium.json'), // ✅ chromium state
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        headless: true,
        storageState: path.resolve('storageState-firefox.json'), // ✅ firefox state
      },
    },
  ],
});
