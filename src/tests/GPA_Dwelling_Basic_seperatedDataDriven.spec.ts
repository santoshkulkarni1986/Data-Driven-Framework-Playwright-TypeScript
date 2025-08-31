/**author : Rashmi HS */

import { test } from '../setup/page-setup';
import * as path from 'path';
import * as fs from 'fs';
import { readExcelfile, writeTestResultsToExcel } from '../Utility/excel-utils';
import { AccountPage } from '../pages/AccountCreationGPAPage';
import { LoginPage } from '../pages/loginPage';
import { PolicyDetailsPage } from '../pages/PolicyDetailsPage';
import { PAUSE_TIMEOUT } from '../Utility/timeout-constants';
import { captureAndAttach, results } from '../testdata/testData';
import logger from '../Utility/logger';
import { getEnv } from '../helper/env/env';

getEnv();

// Paths
const excelPath = path.join(
  __dirname,
  '..',
  'testdata',
  'Dwelling_Basic_GPA_Issuance_Test_Generator_V3.1_new_data.xlsm',
);
const excelDir = path.join(
  process.cwd(),
  'FinalReports',
  'reports',
  'ExcelReports',
);

if (!fs.existsSync(excelDir)) fs.mkdirSync(excelDir, { recursive: true });

const excelResultPath = path.join(excelDir, 'DWB-Result.xlsx');

// Read Excel data
const AccountDetails = readExcelfile(excelPath, 'Account_Creation');
const PolicyDetailsrecords = readExcelfile(excelPath, 'Policy_Details');
const SummaryRecord = readExcelfile(excelPath, 'Summary');

// Filter only rows with Execution = "yes" (case-insensitive & trimmed)
const executableRecords = AccountDetails.map((r, i) => ({
  ...r,
  index: i,
})).filter((r) => r['Execution']?.trim().toLowerCase() === 'yes');

logger.info(`Total executable records found: ${executableRecords.length}`);
if (executableRecords.length === 0) {
  logger.error('No test rows marked for execution in Excel.');
}

// Write results after all tests
test.afterAll(async () => {
  const now = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8);
  const filename = `DwellingBasicGPA_${now}`;
  await writeTestResultsToExcel(excelResultPath, filename, results);
});

// Main test describe
test.describe('GPA DWB Policy Creation Test', () => {
  // Run one test per executable record
  for (const record of executableRecords) {
    const i = record.index;
    const Account = AccountDetails[i];
    const PDrecords = PolicyDetailsrecords[i];
    const summary = SummaryRecord[i];
    const title = summary['TC_Title'] || `Record ${i + 1}`;

    // Test will automatically run once per browser configured in playwright.config.ts
    test(`${title} - Policy Creation`, async ({ page, browserName }, testInfo) => {
      let acc_created = '##';
      let submissionNumber = '##';
      let policy_number = '##';
      let UWI_Description: string[] = [];

      test.setTimeout(1000 * 60 * 30); // 30 min
      page.setDefaultTimeout(1000 * 60 * 10); // 10 min

      try {
        // Step 1: Login
        await test.step('Login to AMSuite', async () => {
          const loginPage = new LoginPage(page);
          await loginPage.navigateToLoginPage();
          await loginPage.clickPolicyLoginLink();
          await loginPage.enterUsername(process.env.USERNAME!);
          await loginPage.clickNextButton();
          await loginPage.enterPassword(process.env.PASSWORD!);
          await loginPage.clickLoginButton();
          await loginPage.verifyLoginSuccess();
        });

        // Step 2: Account Creation
        const accountPage = new AccountPage(page, testInfo);
        const policyDetailsPage = new PolicyDetailsPage(page, testInfo);

        await test.step('Create Account', async () => {
          await accountPage.navigateToGPA(page, testInfo);
          await accountPage.searchAccountDetails(
            page,
            testInfo,
            Account['First_Name'],
            Account['Last_Name'],
            Account['City'],
            Account['ZipCode'],
            Account['State'],
          );
          await accountPage.ClickonContinueasNewCustomer(page, testInfo);
          await accountPage.enterAccountDetails(
            page,
            testInfo,
            Account['DATE_OF_BIRTH'],
            Account['Phone_Type'],
            Account['Phone_Number'],
            Account['Middle_Name'],
            Account['SSN'],
            Account['Customer_Suffix'],
          );
          await accountPage.enterMailingAddress(
            page,
            testInfo,
            Account['CareOf'],
            Account['StreetAddress1'],
            Account['StreetAddress2'],
          );
          await accountPage.ClickonContinue();
        });

        // Step 3: Policy Details
        await test.step('Enter Policy Details', async () => {
          await policyDetailsPage.EnterProducercode(
            testInfo,
            PDrecords['ProducerCode'],
            page,
          );
          await page.waitForTimeout(PAUSE_TIMEOUT);
          acc_created = await accountPage.getAccountNumberGenerated();
          await policyDetailsPage.selectProductType(
            PDrecords['Product'],
            PDrecords['ProductType'],
            page,
            testInfo,
          );
          acc_created = await accountPage.getAccountNumberGenerated();
          submissionNumber = await accountPage.getSubmissionNumberGenerated();

          logger.info(
            `[${browserName}] Submission number: ${submissionNumber}`,
          );
          logger.info(`[${browserName}] Account number: ${acc_created}`);
        });

        // Save result
        results.push({
          testCase: `${title} [${browserName}]`,
          status: acc_created === '' ? 'FAIL' : 'PASS',
          Account_number: acc_created,
          Submission_number: submissionNumber,
          Policy_number: policy_number,
          UWIDescription: UWI_Description,
        });
      } catch (error) {
        await captureAndAttach(page, testInfo, 'Failure Image');
        logger.error(
          `Test failed for ${Account['First_Name']} [${browserName}]:`,
          error,
        );
        results.push({
          testCase: `${title} [${browserName}]`,
          status: `Failed: ${error instanceof Error ? error.message : String(error)}`,
          Account_number: acc_created,
          Submission_number: submissionNumber,
          Policy_number: policy_number,
          UWIDescription: UWI_Description,
        });
        test.fail();
      }
    });
  }
});
