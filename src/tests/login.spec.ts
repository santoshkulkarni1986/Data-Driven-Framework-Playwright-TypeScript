import { test } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { getEnv } from '../helper/env/env';

getEnv();

// ✅ Suite
test.describe('AMSuite Login Suite', () => {
  // Add metadata / annotations

  test('Login with valid credentials', async ({ page }) => {
    test.info().annotations.push({
      type: 'Epic',
      description: 'AMSuite Authentication',
    });
    test
      .info()
      .annotations.push({ type: 'Feature', description: 'Login Feature' });
    test
      .info()
      .annotations.push({ type: 'Story', description: 'Valid Login Flow' });
    test
      .info()
      .annotations.push({ type: 'Owner', description: 'Rashmi Somanathayya' });

    const loginPage = new LoginPage(page);
    let userName = process.env.USERNAME!;
    let passWord = process.env.PASSWORD!;

    await test.step('Navigate to login page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await test.step('Click policy login link', async () => {
      await loginPage.clickPolicyLoginLink();
    });

    await test.step('Enter username', async () => {
      await loginPage.enterUsername(userName);
    });

    await test.step('Click Next button', async () => {
      await loginPage.clickNextButton();
    });

    await test.step('Enter password', async () => {
      await loginPage.enterPassword(passWord);
    });

    await test.step('Click Login button', async () => {
      await loginPage.clickLoginButton();
    });

    await test.step('Verify login success', async () => {
      await loginPage.verifyLoginSuccess();
    });
  });
});
