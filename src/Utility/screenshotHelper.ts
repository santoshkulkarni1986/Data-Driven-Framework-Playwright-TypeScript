// src/utils/screenshot-utils.ts
import { Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export async function takeScreenshot(page: Page, stepName: string) {
  const screenshotsDir = path.resolve(
    process.cwd(),
    'ExecutionLogs',
    'screenshots',
  );

  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const filePath = path.join(
    screenshotsDir,
    `${Date.now()}_${stepName.replace(/\s+/g, '_')}.png`,
  );

  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}
