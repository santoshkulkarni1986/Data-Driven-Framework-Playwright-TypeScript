/**author : Rashmi HS */

import { test } from '../setup/page-setup';
import * as path from 'path';
import * as fs from 'fs';
import { readExcelfile, writeTestResultsToExcel } from '../Utility/excel-utils';
import { AccountPage } from '../pages/AccountCreationGPAPage';
import { PolicyDetailsPage } from '../pages/PolicyDetailsPage';
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

// Filter only rows with Execution = "yes"
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
  logger.info(`Excel results written to ${excelResultPath}`);
});

// Main test describe
test.describe('GPA DWB Policy Creation Test', () => {
  for (const record of executableRecords) {
    const i = record.index;
    const Account = AccountDetails[i];
    const PDrecords = PolicyDetailsrecords[i];
    const summary = SummaryRecord[i];
    const title = summary['TC_Title'] || `Record ${i + 1}`;

    test(`${title} - Policy Creation`, async ({
      page,
      browserName,
    }, testInfo) => {
      let acc_created = '##';
      let submissionNumber = '##';
      let policy_number = '##';
      let UWI_Description: string[] = [];

      test.setTimeout(1000 * 60 * 30); // 30 min
      page.setDefaultTimeout(1000 * 60 * 10); // 10 min

      const accountPage = new AccountPage(page, testInfo);
      const policyDetailsPage = new PolicyDetailsPage(page, testInfo);

      try {
        // 🔹 Step 1: Account Creation
        await test.step('Navigate to GPA Page', async () => {
          await accountPage.navigateToGPA(page, testInfo);
        });

        await test.step('Search Account Details', async () => {
          await accountPage.searchAccountDetails(
            page,
            testInfo,
            Account['First_Name'],
            Account['Last_Name'],
            Account['City'],
            Account['ZipCode'],
            Account['State'],
          );
        });

        await test.step('Click as New Customer', async () => {
          await accountPage.ClickonContinueasNewCustomer(page, testInfo);
        });

        await test.step('Enter Account Details', async () => {
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
        });

        await test.step('Enter Mailing Address Details', async () => {
          await accountPage.enterMailingAddress(
            page,
            testInfo,
            Account['CareOf'],
            Account['StreetAddress1'],
            Account['StreetAddress2'],
          );
        });

        await test.step('Click Continue After Entering Mailing Address', async () => {
          await accountPage.ClickonContinue();
        });

        // 🔹 Step 2: Policy Details
        await test.step('Enter Producer Code Details', async () => {
          await policyDetailsPage.EnterProducercode(
            testInfo,
            PDrecords['ProducerCode'],
            page,
          );
        });

        await test.step('Get Initial Account Number Generated', async () => {
          acc_created = await accountPage.getAccountNumberGenerated();
        });

        await test.step('Select Product Type From Policy Details', async () => {
          await policyDetailsPage.selectProductType(
            PDrecords['Product'],
            PDrecords['ProductType'],
            page,
            testInfo,
          );
        });

        await test.step('Get Final Account & Submission Numbers From Policy', async () => {
          acc_created = await accountPage.getAccountNumberGenerated();
          submissionNumber = await accountPage.getSubmissionNumberGenerated();

          logger.info(
            `[${browserName}] Submission number: ${submissionNumber}`,
          );
          logger.info(`[${browserName}] Account number: ${acc_created}`);
        });

        // 🔹 Save result for this execution
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

        // 🔹 Save failed result
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
