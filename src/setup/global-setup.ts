// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import * as path from 'path';
import { getEnv } from '../helper/env/env';
import logger from '../Utility/logger';

// ✅ Actually call the getEnv function
getEnv();

async function globalSetup(config: FullConfig) {
  // Check if env variables are loaded

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const loginPage = new LoginPage(page);

  await loginPage.navigateToLoginPage();
  //  await loginPage.clickPolicyLoginLink();
  await loginPage.enterUsername(process.env.USERNAME || 'autotester');
  logger.info(`Using username: ${process.env.USERNAME }`);
  await loginPage.clickNextButton();
  await loginPage.enterPassword(process.env.PASSWORD || 'amigp@ss1');
  logger.info(`Using password: ${process.env.PASSWORD }`);
  await loginPage.clickLoginButton();
  await loginPage.verifyLoginSuccess();

  // Save storage state in project root
  const storagePath = path.resolve(process.cwd(), 'storageState.json');
  await context.storageState({ path: storagePath });

  await browser.close();
}

export default globalSetup;
