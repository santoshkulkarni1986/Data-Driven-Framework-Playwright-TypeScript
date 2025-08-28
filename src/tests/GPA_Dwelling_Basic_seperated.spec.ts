import { test } from '../setup/page-setup';
import * as path from 'path';
import { readExcelfile, writeTestResultsToExcel } from '../Utility/excel-utils';
import { AccountPage } from '../pages/AccountCreationGPAPage';
import { LoginPage } from '../pages/loginPage';
import { PolicyDetailsPage } from '../pages/PolicyDetailsPage';
import { MAX_TIMEOUT, PAUSE_TIMEOUT } from '../Utility/timeout-constants';
import { captureAndAttach, results } from '../testdata/testData';
import logger from '../Utility/logger';
import { getEnv } from '../helper/env/env';
import * as fs from 'fs';

getEnv();
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

// Ensure folder exists
if (!fs.existsSync(excelDir)) {
  fs.mkdirSync(excelDir, { recursive: true });
}

// Updated path for Excel result file
const excelResultPath = path.join(excelDir, 'DWB-Result.xlsx');

const AccountDetails = readExcelfile(excelPath, 'Account_Creation');
const PolicyDetailsrecords = readExcelfile(excelPath, 'Policy_Details');
const SummaryRecord = readExcelfile(excelPath, 'Summary');

test.afterAll(async () => {
  const now = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 4);
  const filename = `DwellingBasicGPA_${now}`;
  await writeTestResultsToExcel(excelResultPath, filename, results);
});

let acc_created: string = '##';
let submissionNumber: string = '##';
let policy_number: string = '##';
let UWI_Description: string[] = [];

test.describe('GPA DWB Policy Creation Test', () => {
  test('Login once and create GPA policies', async ({ page }, testInfo) => {
    test.setTimeout(1000 * 60 * 30); // 30 min
    page.setDefaultTimeout(1000 * 60 * 10); // 10 min
    await test.step('Login to AMSuite', async () => {
      const LoginPageTest = new LoginPage(page);
      let userName = process.env.USERNAME!;
      let passWord = process.env.PASSWORD!;
      await LoginPageTest.navigateToLoginPage();
      await LoginPageTest.clickPolicyLoginLink();
      await LoginPageTest.enterUsername(userName);
      await LoginPageTest.clickNextButton();
      await LoginPageTest.enterPassword(passWord);
      await LoginPageTest.clickLoginButton();
      await LoginPageTest.verifyLoginSuccess();
      //await LoginPageTest.logInSuccesfully();
    });

    // Step 2: Loop through 2 records
    const maxRecords = 2;
    for (let i = 0; i < maxRecords; i++) {
      const Account = AccountDetails[i];
      const PDrecords = PolicyDetailsrecords[i];
      const summary = SummaryRecord[i];
      const title = summary['TC_Title'];

      acc_created = '##';
      submissionNumber = '##';
      policy_number = '##';
      UWI_Description = [];

      await test.step(`Record ${i + 1} - ${title}`, async () => {
        try {
          // Account creation
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
            status: `Failed: ${
              error instanceof Error ? error.message : String(error)
            }`,
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
