import { test } from '../setup/page-setup';
import * as path from 'path';
import { readExcelfile, writeTestResultsToExcel } from '../Utility/excel-utils';
import { AccountPage } from '../pages/AccountCreationGPAPage';
import { LoginPage } from '../pages/loginPage';
import { PolicyDetailsPage } from '../pages/PolicyDetailsPage';
import { PAUSE_TIMEOUT } from '../Utility/timeout-constants';
import { captureAndAttach, results } from '../testdata/testData';
import logger from '../Utility/logger';
import { getEnv } from '../helper/env/env';
import * as fs from 'fs';

getEnv();

// Paths
const excelPath = path.join(
  __dirname,
  '..',
  'testdata',
  'Dwelling_Basic_GPA_Issuance_Test_Generator_V3.1_new.xlsm',
);

const excelDir = path.join(
  process.cwd(),
  'FinalReports',
  'reports',
  'ExcelReports',
);
if (!fs.existsSync(excelDir)) fs.mkdirSync(excelDir, { recursive: true });

const excelResultPath = path.join(excelDir, 'DWB-Result.xlsx');

// Read all records from Excel
const AccountDetailsAll = readExcelfile(excelPath, 'Account_Creation');
const PolicyDetailsAll = readExcelfile(excelPath, 'Policy_Details');
const SummaryRecordAll = readExcelfile(excelPath, 'Summary');

// Filter only rows with Execution = Yes
const executableRecordsAll = AccountDetailsAll.map((r, i) => ({
  ...r,
  index: i,
})).filter((r) => r['Execution']?.toLowerCase() === 'yes');

if (executableRecordsAll.length === 0) {
  logger.error('No test rows marked for execution in Excel.');
}

// Write results after all tests
test.afterAll(async () => {
  const now = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8);
  const filename = `DwellingBasicGPA_${now}`;
  await writeTestResultsToExcel(excelResultPath, filename, results);
});

// Global variables
let acc_created: string = '##';
let submissionNumber: string = '##';
let policy_number: string = '##';
let UWI_Description: string[] = [];

test.describe('GPA DWB Policy Creation Test', () => {
  test('Login once and create GPA policies', async ({ page, browserName }, testInfo) => {
    test.setTimeout(1000 * 60 * 30); // 30 min
    page.setDefaultTimeout(1000 * 60 * 10); // 10 min

    // Step 0: Split records per browser
    const AccountDetails = executableRecordsAll.filter(r => r['Browser']?.toLowerCase() === browserName);
    const PolicyDetailsrecords = AccountDetails.map(r => PolicyDetailsAll[r.index]);
    const SummaryRecord = AccountDetails.map(r => SummaryRecordAll[r.index]);

    // Step 1: Login once
    await test.step('Login to AMSuite', async () => {
      const loginPage = new LoginPage(page);
      const userName = process.env.USERNAME!;
      const passWord = process.env.PASSWORD!;
      await loginPage.navigateToLoginPage();
      await loginPage.clickPolicyLoginLink();
      await loginPage.enterUsername(userName);
      await loginPage.clickNextButton();
      await loginPage.enterPassword(passWord);
      await loginPage.clickLoginButton();
      await loginPage.verifyLoginSuccess();
    });

    // Step 2: Loop through records for this browser
    for (let i = 0; i < AccountDetails.length; i++) {
      const Account = AccountDetails[i];
      const PDrecords = PolicyDetailsrecords[i];
      const summary = SummaryRecord[i];
      const title = summary['TC_Title'] || `Record ${i + 1}`;

      acc_created = '##';
      submissionNumber = '##';
      policy_number = '##';
      UWI_Description = [];

      await test.step(`Record ${i + 1} - ${title}`, async () => {
        try {
          logger.info(`Starting test for record ${i + 1}: ${title}`);

          const accountPage = new AccountPage(page, testInfo);
          const policyDetailsPage = new PolicyDetailsPage(page, testInfo);

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
          logger.info('Policy Number to be generated later: ' + policy_number);

          // Save result
          results.push({
            testCase: `${title}: ${i + 1} (${browserName})`,
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
            testCase: `${title}: ${i + 1} (${browserName})`,
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
});
