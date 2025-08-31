/*** Author: Rashmi HS ***/
import { expect, Page, Locator } from '@playwright/test';
import logger from '../Utility/logger';

export class LoginPage {
  private page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly nextButton: Locator;
  readonly loginButton: Locator;
  readonly policyLoginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page
      .locator('#username')
      .describe('Username input field');
    this.passwordInput = page
      .locator('#password')
      .describe('Password input field');
    this.nextButton = page
      .getByRole('button', { name: 'Next' })
      .describe('Next button');
    this.loginButton = page
      .getByRole('button', { name: 'Log in' })
      .describe('Login button');
    this.policyLoginLink = page
      .locator('//a[@href="/pc/PolicyCenter.do?nosso=true"]')
      .describe('Policy login link');
  }

  // ---------------- Existing methods ----------------
  public async navigateToLoginPage(): Promise<void> {
    const action = 'navigating to AMSuite login page';
    try {
      const baseUrl =
        process.env.AMSUITEBASEURL ||
        'https://test.amsuite.amig.com/launch/bypass.html';
      logger.info(`Start ${action}`);
      await this.page.goto(baseUrl, { waitUntil: 'load' });
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      logger.info(`Successfully navigated to AMSuite login page: ${baseUrl}`);
    } catch (error) {
      logger.error(`Error ${action}: ${(error as Error).message}`);
      throw error;
    }
  }

  public async clickPolicyLoginLink(): Promise<void> {
    const action = 'clicking policy login link';
    try {
      logger.info(`Start ${action}`);
      if (await this.policyLoginLink.isVisible()) {
        await this.policyLoginLink.click();
        logger.info('Policy login link clicked successfully.');
      } else {
        logger.info('Policy login link not visible, skipping.');
      }
    } catch (error) {
      logger.error(`Error ${action}: ${(error as Error).message}`);
      throw error;
    }
  }

  public async enterUsername(username: string): Promise<void> {
    const action = `entering username: ${username}`;
    try {
      logger.info(`Start ${action}`);
      await this.usernameInput.fill(username);
      logger.info(`Successfully entered username: ${username}`);
    } catch (error) {
      logger.error(`Error ${action}: ${(error as Error).message}`);
      throw error;
    }
  }

  public async clickNextButton(): Promise<void> {
    const action = 'clicking next button';
    try {
      logger.info(`Start ${action}`);
      await this.nextButton.click();
      logger.info('Next button clicked successfully.');
    } catch (error) {
      logger.error(`Error ${action}: ${(error as Error).message}`);
      throw error;
    }
  }

  public async enterPassword(password: string): Promise<void> {
    const action = 'entering password';
    try {
      logger.info(`Start ${action}`);
      await this.passwordInput.fill(password);
      logger.info('Password entered successfully.');
    } catch (error) {
      logger.error(`Error ${action}: ${(error as Error).message}`);
      throw error;
    }
  }

  public async clickLoginButton(): Promise<void> {
    const action = 'clicking login button';
    try {
      logger.info(`Start ${action}`);
      await this.loginButton.click();
      logger.info('Login button clicked successfully.');
    } catch (error) {
      logger.error(`Error ${action}: ${(error as Error).message}`);
      throw error;
    }
  }

  public async verifyLoginSuccess(
    expectedUserName: string = 'Auto Tester',
  ): Promise<void> {
    const action = 'verifying login success';
    try {
      const expectedUrl =
        process.env.USERSUCCESS ||
        'https://test.amsuite.amig.com/dispatcher/home.do';
      logger.info(`Start ${action}`);
      // 1️⃣ Verify the URL
      logger.info(`Verifying URL is: ${process.env.USERSUCCESS}`);
      await expect(this.page).toHaveURL(expectedUrl, { timeout: 60000 });
      logger.info('Successfully verified URL for login success.');

      // 2️⃣ Wait for the topFrame iframe to appear
      const topFrameLocator = this.page.locator('iframe[name="topFrame"]');
      await topFrameLocator.waitFor({ state: 'attached', timeout: 60000 });

      // 3️⃣ Get iframe content
      const topFrame = await topFrameLocator.contentFrame();
      if (!topFrame) throw new Error('topFrame iframe not found');

      // 4️⃣ Verify the username inside the iframe
      const headerLocator = topFrame.getByText(expectedUserName);
      await expect(headerLocator).toBeVisible({ timeout: 15000 });

      logger.info(
        `Successfully verified user '${expectedUserName}' inside topFrame iframe.`,
      );
    } catch (error) {
      logger.error(`Error ${action}: ${(error as Error).message}`);
      throw error;
    }
  }
}
