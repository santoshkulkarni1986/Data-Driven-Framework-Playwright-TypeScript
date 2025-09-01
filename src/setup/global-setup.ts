import { chromium, firefox, FullConfig } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import * as path from 'path';
import * as fs from 'fs';
import logger from '../Utility/logger';
import { getEnv } from '../helper/env/env';

getEnv();

const STORAGE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds

async function globalSetup(config: FullConfig) {
  const projects = config.projects.map((p) => p.name.toLowerCase());

  for (const browserName of ['chromium', 'firefox']) {
    if (!projects.includes(browserName)) continue;

    const storagePath = path.resolve(
      process.cwd(),
      `storageState-${browserName}.json`,
    );

    // Check if storage exists and is recent
    let shouldLogin = true;
    if (fs.existsSync(storagePath)) {
      const stats = fs.statSync(storagePath);
      const age = Date.now() - stats.mtimeMs;
      if (age < STORAGE_MAX_AGE_MS) {
        logger.info(
          `[${browserName}] Storage state exists and is recent. Skipping login.`,
        );
        shouldLogin = false;
      } else {
        logger.info(
          `[${browserName}] Storage state is older than 1 day. Re-login required.`,
        );
      }
    }

    if (!shouldLogin) continue;

    const browserType = browserName === 'chromium' ? chromium : firefox;
    const browser = await browserType.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    logger.info(`[${browserName}] Navigating to login page...`);
    await loginPage.navigateToLoginPage();

    const username = process.env.TEST_USERNAME || 'autotester';
    const password = process.env.TEST_PASSWORD || 'amigp@ss1';

    logger.info(`[${browserName}] Entering username: ${username}`);
    await loginPage.enterUsername(username);
    await loginPage.clickNextButton();

    logger.info(`[${browserName}] Entering password: ${password}`);
    await loginPage.enterPassword(password);
    await loginPage.clickLoginButton();

    await loginPage.verifyLoginSuccess();
    logger.info(`[${browserName}] Login successful`);

    await context.storageState({ path: storagePath });
    logger.info(`[${browserName}] Storage state saved at ${storagePath}`);

    await browser.close();
  }
}

export default globalSetup;
