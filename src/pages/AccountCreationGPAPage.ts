/**author : Rashmi HS */

import { expect, Page, TestInfo } from '@playwright/test';
import {
  getLocator,
  getLocatorByPlaceholder,
  getLocatorByRole,
  getLocatorByText,
} from '../Utility/locator-utils';
import {
  click,
  fill,
  gotoURL,
  scrollLocatorIntoView,
  selectByText,
  selectByValue,
} from '../Utility/action-utils';
import { MAX_TIMEOUT, STANDARD_TIMEOUT } from '../Utility/timeout-constants';
import {
  captureAndAttach,
  getFullStateName,
  formatToMMDDYYYY,
} from '../testdata/testData';
import { AMSuite_GPAURL } from '../Utility/url-constansts';
import { isElementVisible } from '../Utility/element-utils';
import fs from 'fs';
import logger from '../Utility/logger';
import { getPage } from '../Utility/page-utils';

export class AccountPage {
  private page: Page;
  private testInfo: TestInfo;
  private screenshotFolder = 'FinalReports/ExecutionScreenshots';

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;
    if (!fs.existsSync(this.screenshotFolder))
      fs.mkdirSync(this.screenshotFolder, { recursive: true });
  }

  // -----------------------------
  // Locators (methods to avoid stale handles)
  // -----------------------------
  private startNewQuote = () =>
    getLocator("//div[@class='gw-btn-flat gw-new-quote ng-scope']");
  private firstName = () =>
    getLocator('[ng-model="accountSearchCriteriaView.firstName.value"]');
  private lastName = () =>
    getLocator('[ng-model="accountSearchCriteriaView.lastName.value"]');
  private city = () => getLocatorByRole('textbox', { name: 'City' });
  private zipCode = () => getLocatorByRole('textbox', { name: 'ZIP Code' });
  private stateDropdown = () =>
    getLocator("//select[@placeholder='-- Choose State --']");
  private searchButton = () => getLocatorByRole('button', { name: 'Search' });
  private continueNewCustomer = () =>
    getLocatorByText('Continue as a New Customer');
  private middleName = () =>
    getLocator("//input[@ng-model='accountHolderView.middleName.value']");
  private dob = () => getLocatorByPlaceholder('MM/DD/YYYY').first();
  private phoneType = () =>
    getLocator(
      "//select[@options='accountHolderView.primaryPhoneType.aspects.availableValues']",
    );
  private phoneNumber = () =>
    getLocator('[ng-model="accountHolderView.cellNumber.value"]');
  private addressLine1 = () =>
    getLocator('[ng-model="address.addressLine1.value"]');
  private addressLine2 = () =>
    getLocator('[ng-model="address.addressLine2.value"]');
  private attCareOf = () =>
    getLocatorByRole('textbox', { name: 'Attention/Care Of' });
  private continueButton = () =>
    getLocator('[ng-click="standardizeAddress(address)"]');
  private popupContinueButton = () => getLocator("//button[text()='Continue']");
  private getPopUp = `//div[@class='gw-custom-address-modal ng-scope']`;
  private chooseReason = () =>
    getLocator("//select[@ng-model='overrideReasonSelected']");
  private reEnterAddButton = () =>
    getLocator("//button[text()='Re-Enter Address']");
  private producerCode = () =>
    getLocator("(//input[@ng-model='producerCodeQuickSearch'])[1]");
  private producerCodeNext = () =>
    getLocator('[ng-click="submitCreateAccountForm(newAccountForm)"]');
  private searchProducerBtn = () =>
    getLocatorByRole('button', { name: 'Search Producer' }).first();
  private nextBtn = () => getLocatorByRole('button', { name: 'Next' });
  private productCode = () => getLocator('#ProductCode');
  private policyType = () => getLocator('#PolicyType');
  private popupForHomePage = "//div[@class='gw-modal__inner']";
  private yesButtonInPopup = () =>
    getLocator("//button[@class='gw-btn gw-btn-primary']");
  private accountNumber = () =>
    getLocator("//div[@ng-show='isAnExistingAccount']//p[@class='ng-binding']");
  private custSuffix = () =>
    getLocator('[gw-pl-select="accountHolderView.suffix.value"]');
  private submissionNumber = () =>
    getLocator(
      "a[ui-sref='quote.detail.summary({submissionNumber : quoteID})']",
    );
  private ssNumber = () => getLocator("//input[contains(@id, 'ssn')]");

  /**
   *
   * @param page
   * @param testInfo
   */
  public async navigateToGPA(page: Page, testInfo: TestInfo) {
    try {
      logger.info('Navigating to GPA home page...');
      await gotoURL(AMSuite_GPAURL, { timeout: MAX_TIMEOUT });
      await captureAndAttach(page, testInfo, 'Navigate to GPA Home Page');
      await page.waitForLoadState('load', { timeout: MAX_TIMEOUT });
      const startQuote = await this.startNewQuote();
      await startQuote.waitFor({ state: 'visible', timeout: 60000 });
      logger.info('Start New Quote button is visible.');

      const popupVisible = await isElementVisible(this.popupForHomePage);
      if (popupVisible) {
        logger.info("Popup detected on Home Page. Clicking 'Yes' button...");
        await this.yesButtonInPopup().waitFor({
          state: 'visible',
          timeout: 60000,
        });
        await this.yesButtonInPopup().click({ force: true });
        await page.waitForTimeout(5000);
        await captureAndAttach(
          page,
          testInfo,
          'Clicked Yes on Home Page Popup',
        );
        logger.info('Popup handled successfully.');
      }
      await captureAndAttach(page, testInfo, 'Landed on GPA Home Page');
      logger.info('Successfully landed on GPA Home Page.');
    } catch (error) {
      logger.error('Error navigating to GPA home page:', error);
      await captureAndAttach(page, testInfo, 'Error in navigateToGPA');
      throw new Error(
        `navigateToGPA failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  /**
   *
   * @param page
   * @param testInfo
   * @param firstName
   * @param lastName
   * @param city
   * @param ZipCode
   * @param State
   */
  public async searchAccountDetails(
    page: Page,
    testInfo: TestInfo,
    firstName: string,
    lastName: string,
    city: string,
    ZipCode: string,
    State: string,
  ) {
    try {
      logger.info(
        `Searching account details for: ${firstName} ${lastName}, ${city}, ${ZipCode}, ${State}`,
      );

      logger.info(`Clicking on Start New Quote button`);
      await click(this.startNewQuote(), { timeout: MAX_TIMEOUT });
      logger.info(`Start New Quote button clicked`);

      logger.info(`Filling the firstname in search details`);
      await fill(this.firstName(), firstName);

      logger.info(`Filling the lastname in search details`);
      await fill(this.lastName(), lastName);
      logger.info(
        `Successfully filled first and last name:${firstName} ${lastName}`,
      );

      logger.info(`Filling the city in search details`);
      await fill(this.city(), city);
      logger.info(`Successfully filled city: ${city}`);

      logger.info(`Filling the zip code in search details`);
      await fill(this.zipCode(), ZipCode);
      logger.info(`Successfully filled zip code: ${ZipCode}`);

      const fullStateName = getFullStateName(State);
      logger.info(`Mapped state: ${State} → ${fullStateName}`);
      await selectByText(this.stateDropdown(), fullStateName);

      await captureAndAttach(page, testInfo, 'Search Account Details Image');

      logger.info(`Clicking on Search button`);
      await click(this.searchButton(), { timeout: MAX_TIMEOUT });
      logger.info(`Search button clicked successfully`);
    } catch (error) {
      logger.error(
        `Error in searchAccountDetails: ${error instanceof Error ? error.message : error}`,
      );
      await captureAndAttach(page, testInfo, 'Error_SearchAccountDetails');
      throw new Error(
        `searchAccountDetails failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   *
   * @param page
   * @param testInfo
   */
  public async ClickonContinueasNewCustomer(page: Page, testInfo: TestInfo) {
    try {
      logger.info(`Clicking on Continue as New Customer button`);
      await click(this.continueNewCustomer(), { timeout: MAX_TIMEOUT });
      logger.info(
        `Continue as New Customer button clicked successfully: ${this.continueNewCustomer().toString()} `,
      );
      await captureAndAttach(
        page,
        testInfo,
        'Clicked Continue as New Customer',
      );
    } catch (error) {
      logger.error(
        `Error clicking on Continue as New Customer button: ${error instanceof Error ? error.message : error}`,
      );
      await captureAndAttach(
        page,
        testInfo,
        'Error_Clicking_ContinueAsNewCustomer',
      );
      throw error; // re-throw to fail the test
    }
  }
  /**
   * Enters account details on the form
   * @param page
   * @param testInfo
   * @param DOB
   * @param phonetype
   * @param PhoneNumber
   * @param middleName
   * @param ssn
   * @param Customer_Suffix
   */
  public async enterAccountDetails(
    page: Page,
    testInfo: TestInfo,
    DOB: any,
    phonetype: string,
    PhoneNumber: string,
    middleName: string = '',
    ssn: string,
    Customer_Suffix: string = '',
  ) {
    try {
      logger.info(
        `Entering account details: DOB=${DOB}, PhoneType=${phonetype}, PhoneNumber=${PhoneNumber}, MiddleName=${middleName}, SSN=${ssn}, CustomerSuffix=${Customer_Suffix}`,
      );

      // Middle name
      logger.info(`Filling middle name: ${middleName}`);
      await fill(this.middleName(), middleName);
      logger.info(`Successfully filled middle name`);

      // DOB
      const formattedDate = formatToMMDDYYYY(DOB);
      logger.info(`Filling date of birth: ${formattedDate}`);
      await fill(this.dob(), formattedDate);
      logger.info(`Successfully filled date of birth:${this.dob().toString()}`);

      // Phone type & number
      logger.info(`Selecting phone type: ${phonetype}`);
      await selectByText(this.phoneType(), phonetype);
      logger.info(`Successfully selected phone type: ${phonetype}`);
      logger.info(`Filling phone number: ${PhoneNumber}`);
      await fill(this.phoneNumber(), PhoneNumber);
      logger.info(`Successfully filled phone number: ${PhoneNumber}`);

      // SSN
      logger.info(`Filling SSN: ${ssn}`);
      await scrollLocatorIntoView(this.ssNumber());
      logger.info(
        `Successfully scrolled to SSN field: ${this.ssNumber().toString()}`,
      );
      await fill(this.ssNumber(), ssn);
      logger.info(`Successfully filled SSN`);

      // Customer suffix
      logger.info(`Selecting Customer Suffix: ${Customer_Suffix}`);
      await selectByText(this.custSuffix(), Customer_Suffix);
      logger.info(`Successfully selected Customer Suffix: ${Customer_Suffix}`);

      // Capture screenshot
      await captureAndAttach(page, testInfo, 'Enter account details');
      logger.info(
        `Account details entered successfully: ${this.middleName().toString()}, ${this.dob().toString()}, ${this.phoneType().toString()}, ${this.phoneNumber().toString()}, ${this.ssNumber().toString()}, ${this.custSuffix().toString()}`,
      );
    } catch (error) {
      logger.error(
        `Error while entering account details: ${error instanceof Error ? error.message : String(error)}`,
      );
      await captureAndAttach(page, testInfo, 'Error_EnterAccountDetails');
      throw error; // re-throw to fail the test
    }
  }
  /**
   * Enters mailing address details
   * @param page
   * @param testInfo
   * @param CareOf
   * @param AddLine1
   * @param AddLine2
   */
  public async enterMailingAddress(
    page: Page,
    testInfo: TestInfo,
    CareOf: string = '',
    AddLine1: string = '',
    AddLine2: string = '',
  ) {
    try {
      logger.info(
        `Entering mailing address: CareOf=${CareOf}, AddressLine1=${AddLine1}, AddressLine2=${AddLine2}`,
      );

      // Address Line 1
      logger.info(`Scrolling to Address Line 1 field`);
      await this.addressLine1().scrollIntoViewIfNeeded();
      logger.info(
        `Successfully scrolled to Address Line 1 field: ${this.addressLine1().toString()}`,
      );
      logger.info(`Filling Address Line 1: ${AddLine1}`);
      await fill(this.addressLine1(), AddLine1);
      logger.info(`Successfully filled Address Line 1: ${AddLine1}`);

      // Address Line 2
      logger.info(`Filling Address Line 2: ${AddLine2}`);
      await fill(this.addressLine2(), AddLine2);
      logger.info(`Successfully filled Address Line 2: ${AddLine2}`);

      // Care Of
      logger.info(`Filling Attention/Care Of: ${CareOf}`);
      await fill(this.attCareOf(), CareOf);
      logger.info(`Successfully filled Attention/Care Of: ${CareOf}`);
      //scroll to Care Of field
      logger.info(`Scrolling to Attention/Care Of field`);
      await this.attCareOf().scrollIntoViewIfNeeded();
      logger.info(`Successfully scrolled to Attention/Care Of field`);

      // Capture screenshot
      await captureAndAttach(page, testInfo, 'Enter mailing address');
      logger.info(
        `Mailing address entered successfully: ${this.addressLine1().toString()}, ${this.addressLine2().toString()}, ${this.attCareOf().toString()}`,
      );
    } catch (error) {
      logger.error(
        `Error while entering mailing address: ${error instanceof Error ? error.message : String(error)}`,
      );
      await captureAndAttach(page, testInfo, 'Error_EnterMailingAddress');
      throw error; // re-throw to fail the test
    }
  }
  /**
   * Returns true if Continue as New Customer button is visible
   * @returns {Promise<boolean>}
   *  @throws {Error} If there is an issue checking the button visibility
   *
   */
  public async IsDisplayedContinueasNewCustomer(): Promise<boolean> {
    try {
      const isVisible = await isElementVisible(this.continueNewCustomer());
      logger.info(
        'Checked visibility of Continue as New Customer button: ' + isVisible,
      );
      return isVisible;
    } catch (error) {
      logger.error(
        `Error while checking visibility of Continue as New Customer button: ${error instanceof Error ? error.message : error}`,
      );
      await captureAndAttach(
        this.page,
        this.testInfo,
        'Error_ContinueAsNewCustomer',
      );
      // returning false in case of exception
      return false;
    }
  }

  /**
   * Returns true if Start New Quote button is visible
   */
  public async isDisplayedNewQuoteForExistingCustomer(
    page: Page,
    testInfo: TestInfo,
  ): Promise<boolean> {
    try {
      const isVisible = await isElementVisible(this.startNewQuote());
      logger.info(`Checked visibility of Start New Quote button: ${isVisible}`);
      return isVisible;
    } catch (error) {
      logger.error(
        `Error checking visibility of Start New Quote button: ${error instanceof Error ? error.message : error}`,
      );
      await captureAndAttach(page, testInfo, 'Error_Checking_StartNewQuote');
      return false; // or throw error if you want test to fail
    }
  }

  /**
   * Clicks on Start New Quote for Existing Customer
   */
  public async clickStartNewQuoteForExistingCust(
    page: Page,
    testInfo: TestInfo,
  ): Promise<void> {
    try {
      logger.info(`Clicking on Start New Quote button for existing customer`);
      await click(this.startNewQuote(), { timeout: MAX_TIMEOUT });
      logger.info(`Start New Quote button clicked successfully`);
      await captureAndAttach(page, testInfo, 'Clicked_StartNewQuote');
    } catch (error) {
      logger.error(
        `Error clicking on Start New Quote button: ${error instanceof Error ? error.message : error}`,
      );
      await captureAndAttach(page, testInfo, 'Error_Clicking_StartNewQuote');
      throw error; // re-throw to fail the test
    }
  }

  /**
   * Clicks on Continue button and handles address validation popup if it appears
   * @param page
   * @param testInfo
   */
  public async ClickonContinue() {
    try {
      logger.info('Scrolling to Continue button and clicking it');
      await this.continueButton().scrollIntoViewIfNeeded();
      logger.info('Successfully scrolled to Continue button');
      logger.info('Clicking Continue button');
      await this.continueButton().click({ force: true });
      logger.info('Clicked Continue button successfully');

      // Handle first type of popup
      if (await isElementVisible(this.popupContinueButton())) {
        logger.info(
          'Address validation popup detected, clicking popup Continue button',
        );
        logger.info('Scrolling to Popup Continue button');
        await this.popupContinueButton().scrollIntoViewIfNeeded();
        logger.info('Successfully scrolled to Popup Continue button');
        logger.info(`clicking popup Continue button`);
        await this.popupContinueButton().click({ force: true });
        logger.info('Popup Continue button clicked successfully');
      }
      // Handle second type of popup
      else if (await getPage().isVisible(this.getPopUp)) {
        logger.info('Alternative popup detected, handling it');
        logger.info(
          `Clicking Re-Enter Address button with selector: ${this.reEnterAddButton().toString()}`,
        );
        await click(this.reEnterAddButton());
        logger.info('Re-Enter Address button clicked successfully');
        logger.info(
          `Clicking Continue button with selector: ${this.continueButton().toString()}`,
        );
        await click(this.continueButton());
        logger.info(
          'Continue button clicked successfully after Re-Enter Address',
        );
        logger.info(`Selecting reason 'New Construction' from dropdown`);
        await selectByText(this.chooseReason(), 'New Construction');
        logger.info("Reason 'New Construction' selected successfully");
        logger.info('Scrolling to Popup Continue button');
        await this.popupContinueButton().scrollIntoViewIfNeeded();
        logger.info('Successfully scrolled to Popup Continue button');
        logger.info(
          `Clicking Continue button with selector: ${this.popupContinueButton().toString()}`,
        );
        await this.popupContinueButton().click({ force: true });
        logger.info(
          'Popup Continue button clicked successfully after handling alternative popup',
        );
      }
    } catch (error) {
      logger.error(
        `Error in ClickonContinue: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Re-throw to fail the test
      throw error;
    }
  }
  /**
   * Waits for account number element and returns the generated account number
   * @returns Account number generated
   */
  public async getAccountNumberGenerated(): Promise<string> {
    try {
      await isElementVisible(this.accountNumber(), {
        timeout: STANDARD_TIMEOUT,
      });
      const acc = (await this.accountNumber().textContent())?.trim() ?? '';
      logger.info(`Account number generated: ${acc}`);
      return acc;
    } catch (error) {
      logger.error(
        `Failed to fetch account number: ${(error as Error).message}`,
      );
      throw new Error('Account number could not be retrieved');
    }
  }

  /**
   * Waits for submission number element and returns the generated submission number
   * @returns Submission number generated
   */
  public async getSubmissionNumberGenerated(): Promise<string> {
    try {
      await isElementVisible(this.submissionNumber(), {
        timeout: MAX_TIMEOUT,
      });
      const subNum =
        (await this.submissionNumber().textContent())?.trim() ?? '';
      logger.info(`Submission number generated: ${subNum}`);
      return subNum;
    } catch (error) {
      logger.error(
        `Failed to fetch submission number: ${(error as Error).message}`,
      );
      throw new Error('Submission number could not be retrieved');
    }
  }

  /**
   * Enters producer code
   * @param page Playwright Page
   */
  public async EnterProducercode() {
    try {
      logger.info('Starting EnterProducercode method');
      logger.info('Clicking on Producer Code input field');
      await click(this.producerCode());
      logger.info('Producer Code input field clicked successfully');
      logger.info('Clearing and entering producer code: 999006');
      await this.producerCode().press('Home');
      await fill(this.producerCode(), '999006');
      logger.info('Producer code entered successfully');
      logger.info('Clicking Search Producer button');
      await click(this.searchProducerBtn());
      logger.info('Search Producer button clicked successfully');
      logger.info('Scrolling into view Next button');
      await this.nextBtn().first().scrollIntoViewIfNeeded();
      logger.info('Successfully scrolled to Next button');
      logger.info('Taking screenshot of Next button before clicking');
      await this.nextBtn()
        .first()
        .screenshot({ path: 'reports/screenshots/nextBtn.png' });
      logger.info('Screenshot taken successfully');

      logger.info('Clicking Next button');
      await this.nextBtn().first().click({ force: true });
      logger.info('Next button clicked successfully');

      logger.info('Successfully completed EnterProducercode method ✅');
    } catch (error: any) {
      logger.error(` Error in EnterProducercode: ${error.message}`);
      throw error; // rethrow so test fails and can capture screenshot
    }
  }

  /**
   * Selects product type and policy type and clicks next
   * @returns Promise<void>
   */
  public async selectProductType(): Promise<void> {
    try {
      const productCode1 = 'Homeowners';
      const policyType1 = 'DwellingBasic';
      logger.info('Selecting product type and policy type...');
      logger.info('Scrolling into view: Product Code dropdown');
      await this.policyType().scrollIntoViewIfNeeded();
      logger.info('Scrolled into view: Policy Type dropdown');
      logger.info('Selecting Product Code: Homeowners');
      await selectByValue(this.productCode(), productCode1);
      logger.info('Selected Product Code: Homeowners');
      logger.info('Selecting Policy Type: DwellingBasic');
      await selectByValue(this.policyType(), policyType1);
      logger.info('Selected Policy Type: DwellingBasic');
      logger.info('Scrolling into view: Next button');
      await this.nextBtn().screenshot();
      logger.info('Captured screenshot before clicking Next');
      logger.info('Clicking on the Next button');
      await click(this.nextBtn());
      logger.info('Clicked Next button successfully.');
    } catch (error) {
      logger.error(
        `Error in selectProductType: ${error instanceof Error ? error.message : error}`,
      );
      throw error; // rethrow so test fails and report captures it
    }
  }

  /**
   * Verifies if Dwelling Basic account is created
   * @returns Promise<void>
   */
  public async isAccountCreated(): Promise<void> {
    try {
      logger.info('Verifying Dwelling Basic account creation...');

      await expect(getPage().getByText('Dwelling Basic - Quote')).toBeVisible();
      logger.info('Verified: Dwelling Basic - Quote text is visible');

      await expect(getPage().getByText('Quote has been saved.')).toBeVisible();
      logger.info('Verified: Quote has been saved message is visible');

      logger.info('Dwelling Basic account created successfully.');
    } catch (error) {
      logger.error(
        `Error in isAccountCreated: ${error instanceof Error ? error.message : error}`,
      );
      await getPage().screenshot({
        path: `screenshots/isAccountCreated-error.png`,
      });
      throw error;
    }
  }

  /**
   * Verifies if Dwelling Special account is created
   * @returns Promise<void>
   */
  public async isDSAccountCreated(): Promise<void> {
    try {
      logger.info('Verifying Dwelling Special account creation...');

      await expect(
        getPage().getByText('Dwelling Special - Quote'),
      ).toBeVisible();
      logger.info('Verified: Dwelling Special - Quote text is visible');

      await expect(getPage().getByText('Quote has been saved.')).toBeVisible();
      logger.info('Verified: Quote has been saved message is visible');

      logger.info('Dwelling Special account created successfully.');
    } catch (error) {
      logger.error(
        `Error in isDSAccountCreated: ${error instanceof Error ? error.message : error}`,
      );
      await getPage().screenshot({
        path: `screenshots/isDSAccountCreated-error.png`,
      });
      throw error;
    }
  }
  /**
   * Clicks nexton producer code
   */
  public async ClickNextonProducerCode() {
    try {
      logger.info('Attempting to click Producer Code Next button...');
      await click(this.producerCodeNext());
      logger.info('Successfully clicked Producer Code Next button.');
    } catch (error) {
      logger.error(
        `Failed to click Producer Code Next button. Error: ${(error as Error).message}`,
      );
      throw error; // rethrow so test fails
    }
  }

  /**
   * Enters account details on the form
   * @param page
   * @param testInfo
   * @param DOB
   * @param phonetype
   * @param PhoneNumber
   * @param middleName
   * @param ssn
   * @param Customer_Suffix
   */
  public async enterAccountDetailsForAccountCreation(
    page: Page,
    testInfo: TestInfo,
    DOB: any,
    phonetype: string,
    PhoneNumber: string,
    StreetAddress1: string,
  ) {
    try {
      logger.info(
        `Entering account details: DOB=${DOB}, PhoneType=${phonetype}, PhoneNumber=${PhoneNumber}, StreetAddress1=${StreetAddress1}`,
      );

      // DOB
      const formattedDate = formatToMMDDYYYY(DOB);
      logger.info(`Filling date of birth: ${formattedDate}`);
      await fill(this.dob(), formattedDate);
      logger.info(`Successfully filled date of birth`);

      // Phone type & number
      logger.info(`Selecting phone type: ${phonetype}`);
      await selectByText(this.phoneType(), phonetype);
      logger.info(`Successfully selected phone type`);
      logger.info(`Filling phone number: ${PhoneNumber}`);
      await fill(this.phoneNumber(), PhoneNumber);
      logger.info(`Successfully filled phone number`);

      logger.info(`Scrolling to Address Line 1 field`);
      await this.addressLine1().scrollIntoViewIfNeeded();
      logger.info(`Successfully scrolled to Address Line 1 field`);
      logger.info(`Filling Address Line 1: ${StreetAddress1}`);
      await fill(this.addressLine1(), StreetAddress1);
      logger.info(`Successfully filled Address Line 1`);

      // Capture screenshot
      await captureAndAttach(page, testInfo, 'Enter account details');
      logger.info(`Account details entered successfully`);
    } catch (error) {
      logger.error(
        `Error while entering account details: ${error instanceof Error ? error.message : String(error)}`,
      );
      await captureAndAttach(page, testInfo, 'Error_EnterAccountDetails');
      throw error; // re-throw to fail the test
    }
  }
}
