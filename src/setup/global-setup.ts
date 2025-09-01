import { chromium, firefox, FullConfig } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import * as path from 'path';
import { getEnv } from '../helper/env/env';
import logger from '../Utility/logger';
import { log } from 'console';

getEnv(); // ✅ Load environment variables

async function globalSetup(config: FullConfig) {
  const projects = config.projects.map((p) => p.name.toLowerCase());

  for (const browserName of ['chromium', 'firefox']) {
    if (projects.includes(browserName)) {
      const browserType = browserName === 'chromium' ? chromium : firefox;
      const browser = await browserType.launch();
      const context = await browser.newContext();
      const page = await context.newPage();
      const loginPage = new LoginPage(page);

      logger.info(`[${browserName}] Navigating to login page...`);
      await loginPage.navigateToLoginPage();

      // 🔑 Read creds from env
      const username = process.env.TEST_USERNAME || 'autotester';
      const password = process.env.TEST_PASSWORD || 'amigp@ss1';

      logger.info(`[${browserName}] Entering username: ${username}`);
      await loginPage.enterUsername(username);

      await loginPage.clickNextButton();

      logger.info(`[${browserName}] Entering password: [HIDDEN]`);
      logger.info(`[${browserName}] Entering password: ${password}`);
      await loginPage.enterPassword(password);

      await loginPage.clickLoginButton();

      await loginPage.verifyLoginSuccess();
      logger.info(`[${browserName}] Login successful`);

      // Save storage state separately per browser
      const storagePath = path.resolve(
        process.cwd(),
        `storageState-${browserName}.json`,
      );
      await context.storageState({ path: storagePath });
      logger.info(`[${browserName}] Storage state saved at ${storagePath}`);

      await browser.close();
    }
  }
}

export default globalSetup;
