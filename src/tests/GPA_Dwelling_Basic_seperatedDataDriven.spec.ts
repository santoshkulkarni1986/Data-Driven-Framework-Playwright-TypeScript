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

// Filter only rows with Execution = Yes
const executableRecords = AccountDetails.map((r, i) => ({
  ...r,
  index: i,
})).filter((r) => r['Execution']?.toLowerCase() === 'yes');

if (executableRecords.length === 0) {
  logger.error('No test rows marked for execution in Excel.');
}

// Write results after all
test.afterAll(async () => {
  const now = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8);
  const filename = `DwellingBasicGPA_${now}`;
  await writeTestResultsToExcel(excelResultPath, filename, results);
});

test.describe('GPA DWB Policy Creation Test', () => {
  for (const record of executableRecords) {
    const i = record.index;
    const Account = AccountDetails[i];
    const PDrecords = PolicyDetailsrecords[i];
    const summary = SummaryRecord[i];
    const title = summary['TC_Title'] || `Record ${i + 1}`;

    // Use the test title, browser will come from playwright.config.ts
    test(`${title} - Policy Creation`, async ({ page }, testInfo) => {
      let acc_created: string = '##';
      let submissionNumber: string = '##';
      let policy_number: string = '##';
      let UWI_Description: string[] = [];

      test.setTimeout(1000 * 60 * 30); // 30 min
      page.setDefaultTimeout(1000 * 60 * 10); // 10 min

      try {
        // Step 1: Login
        await test.step('Login to AMSuite', async () => {
          const LoginPageTest = new LoginPage(page);
          await LoginPageTest.navigateToLoginPage();
          await LoginPageTest.clickPolicyLoginLink();
          await LoginPageTest.enterUsername(process.env.USERNAME!);
          await LoginPageTest.clickNextButton();
          await LoginPageTest.enterPassword(process.env.PASSWORD!);
          await LoginPageTest.clickLoginButton();
          await LoginPageTest.verifyLoginSuccess();
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

          logger.info(`Submission number: ${submissionNumber}`);
          logger.info(`Account number: ${acc_created}`);
        });

        // Save result
        results.push({
          testCase: `${title}: ${i + 1}`,
          status: acc_created === '' ? 'FAIL' : 'PASS',
          Account_number: acc_created,
          Submission_number: submissionNumber,
          Policy_number: policy_number,
          UWIDescription: UWI_Description,
        });
      } catch (error) {
        await captureAndAttach(page, testInfo, 'Failure Image');
        logger.error(`Test failed for ${Account['First_Name']}:`, error);
        results.push({
          testCase: `${title}: ${i + 1}`,
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
