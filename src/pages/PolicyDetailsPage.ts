import { TestInfo, Page } from '@playwright/test';
import { getLocator, getLocatorByRole } from '../Utility/locator-utils';
import { click, fill, selectByText } from '../Utility/action-utils';
import { captureAndAttach } from '../testdata/testData';
import {
  TIMEOUT_4_SECONDS,
  TIMEOUT_8_SECONDS,
} from '../Utility/timeout-constants';
import { getPage } from '../Utility/page-utils';
import logger from '../Utility/logger';

export class PolicyDetailsPage {
  private page: Page;
  private testInfo: TestInfo;

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;
  }

  // ------------------
  // Locators
  // ------------------
  private producerCode = () =>
    getLocator("(//input[@ng-model='producerCodeQuickSearch'])[1]");
  private producerCodeNext = () =>
    getLocator('[ng-click="submitCreateAccountForm(newAccountForm)"]');
  private searchProducerBtn = () =>
    getLocatorByRole('button', { name: 'Search Producer' }).first();
  private nextBtn = () => getLocatorByRole('button', { name: 'Next' });
  private productCode = () => getLocator('#ProductCode');
  private policyType = () => getLocator('#PolicyType');
  private effectiveDate = () =>
    getLocatorByRole('textbox', { name: 'MM/DD/YYYY' });
  private yesButtonInsuranceScore = () =>
    getLocator(
      "//div[contains(@label, 'insurance score.')]/div//label[@title='Yes']",
    );
  private yesClaimHistoryProvider = () =>
    getLocator(
      "//div[contains(@label, 'claims history provider.')]/div//label[@title='Yes']",
    );
  private yesDisclaimerRead = () =>
    getLocator(
      "//div[contains(@label, 'Disclaimer has been read')]/div//label[@title='Yes']",
    );
  private noPaymentsforProperty = () =>
    getLocator(
      "//div[contains(@label, 'past due on mortgage payments')]//div[@title2='No']",
    );
  private noFraudOffenses = () =>
    getLocator(
      "//div[contains(@label, 'insurance-related offenses?')]//div[@title2='No']",
    );
  private nextButtoninPolicyDetails = () =>
    getLocator("//button[@ng-click='goToNext()']");
  private yesButtonApplicantMoved = () =>
    getLocator(
      "//div[contains(@label, 'Has the applicant moved in the last 60 days?')]//div[@title2='No']",
    );
  private addressLine1 = () =>
    getLocator('[ng-model="address.addressLine1.value"]');
  private addressLine2 = () =>
    getLocator('[ng-model="address.addressLine2.value"]');
  private attCareOf = () =>
    getLocatorByRole('textbox', { name: 'Attention/Care Of' });
  private city = () => getLocator('[ng-model="address.city.value"]');
  private zipCode = () => getLocator('[ng-model="address.postalCode.value"]');
  private stateDropdown = () =>
    getLocator("//select[@placeholder='---Choose State---']");
  private buttonContinue = () =>
    getLocatorByRole('button', { name: 'Continue' });
  private warningMsg = () =>
    getLocator(
      '//div[contains(., "The policy address is not a deliverable address according to the US Postal Service.")]',
    );
  /**
   *
   * @param testInfo
   * @param producerCode
   * @param page
   */
  public async EnterProducercode(
    testInfo: TestInfo,
    producerCode: string | number,
    page: Page,
  ) {
    try {
      const codestr = String(producerCode);
      logger.info(`Entering Producer Code: ${codestr}`);

      await this.producerCode().waitFor({ state: 'visible', timeout: 5000 });
      await this.producerCode().scrollIntoViewIfNeeded();
      await click(this.producerCode());
      await this.producerCode().press('Home');
      await fill(this.producerCode(), codestr);

      logger.info(`Clicking Search Producer button`);
      await this.searchProducerBtn().waitFor({
        state: 'visible',
        timeout: 5000,
      });
      await click(this.searchProducerBtn());

      await page.waitForTimeout(4000);
      await captureAndAttach(page, testInfo, 'Enter Producer code');

      logger.info(`Clicking Next button`);
      await this.nextBtn().first().click({ force: true });

      logger.info(`Producer code entered successfully`);
    } catch (error) {
      logger.error(`Failed to enter Producer code: ${error}`);
      await captureAndAttach(page, testInfo, 'Producer code entry failure');
      throw error; // rethrow to mark test step as failed
    }
  }

  /**
   *
   * @param product
   * @param policyType
   * @param page
   * @param testInfo
   */
  public async selectProductType(
    product: string,
    policyType: string,
    page: Page,
    testInfo: TestInfo,
  ) {
    try {
      logger.info(`Selecting Product: ${product}, Policy Type: ${policyType}`);

      await this.productCode().scrollIntoViewIfNeeded();
      await selectByText(this.productCode(), product);
      await selectByText(this.policyType(), policyType);

      await captureAndAttach(
        page,
        testInfo,
        'Selected Product and Policy Type',
      );

      logger.info(`Clicking Next button`);
      await click(this.nextBtn());

      logger.info(`Product and Policy Type selected successfully`);
    } catch (error) {
      logger.error(`Failed to select Product/Policy Type: ${error}`);
      await captureAndAttach(
        page,
        testInfo,
        'Product/Policy selection failure',
      );
      throw error; // rethrow to mark test step as failed
    }
  }
}
