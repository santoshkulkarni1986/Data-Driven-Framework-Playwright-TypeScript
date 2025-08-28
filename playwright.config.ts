import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { getEnv } from './src/helper/env/env';

getEnv();

// Ensure report folders exist before tests run
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
        outputFolder: 'FinalReports/playwright-report',
        title: 'Santosh Kulkarni POC',
      },
    ],
    ['junit', { outputFile: 'FinalReports/test-results/results.xml' }],
    ['@estruyf/github-actions-reporter'],
    // ✅ Use compiled JS for CI
   [
  'ts-node/register',
  {
    require: './src/Utility/PdfReporter.ts',
    outputFolder: 'FinalReports/reports/pdf'
  }
],
    [
      'monocart-reporter',
      {
        name: 'Playwright Custom Report',
        outputFile: './FinalReports/monocart-report/index.html',
      },
    ],
    ['json', { outputFile: 'FinalReports/test-results/results.json' }],
  ],

  use: {
    baseURL: process.env.AMSUITEBASEURL || 'https://default-url.com',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], headless: true },
    },
  ],
});
