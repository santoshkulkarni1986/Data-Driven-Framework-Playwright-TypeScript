/**author : Rashmi HS */
import { TestInfo, Page } from '@playwright/test';
import { getLocator, getLocatorByRole } from '../Utility/locator-utils';
import { click, fill, selectByText } from '../Utility/action-utils';
import { captureAndAttach } from '../testdata/testData';
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
  private searchProducerBtn = () =>
    getLocatorByRole('button', { name: 'Search Producer' }).first();
  private nextBtn = () => getLocatorByRole('button', { name: 'Next' });
  private productCode = () => getLocator('#ProductCode');
  private policyType = () => getLocator('#PolicyType');
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
      logger.info(
        `Scrolling to Producer Code field: ${this.producerCode().toString()}`,
      );
      await this.producerCode().scrollIntoViewIfNeeded();
      logger.info(`Successfully scrolled to Producer Code field`);
      logger.info(
        `clicking Producer Code field: ${this.producerCode().toString()}`,
      );
      await click(this.producerCode());
      logger.info(
        `Successfully clicked Producer Code field: ${this.producerCode().toString()}`,
      );
      await this.producerCode().press('Home');
      logger.info(`Pressed 'Home' key in Producer Code field`);
      logger.info(`Filling Producer Code field with value: ${codestr}`);
      await fill(this.producerCode(), codestr);
      logger.info(
        `Successfully filled Producer Code field with value: ${codestr}`,
      );
      logger.info(
        `Clicking Search Producer button: ${this.searchProducerBtn().toString()}`,
      );
      await this.searchProducerBtn().waitFor({
        state: 'visible',
        timeout: 5000,
      });
      await click(this.searchProducerBtn());
      logger.info(`Clicked Search Producer button successfully`);
      logger.info(`Waiting for 4 seconds to allow search results to load`);
      await page.waitForTimeout(4000);
      await captureAndAttach(page, testInfo, 'Enter Producer code');
      logger.info(`Clicking Next button`);
      await this.nextBtn().first().click({ force: true });
      logger.info(
        `Clicked Next button successfully: ${this.nextBtn().toString()}`,
      );
      logger.info(`Producer code entered successfully: ${codestr}`);
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
      logger.info(
        `Scrolling to Product Code dropdown: ${this.productCode().toString()}`,
      );
      await this.productCode().waitFor({ state: 'visible', timeout: 5000 });
      logger.info(`Clicked Product Code dropdown successfully`);
      await selectByText(this.productCode(), product);
      logger.info(`Successfully selected Product: ${product}`);
      await selectByText(this.policyType(), policyType);
      logger.info(`Successfully selected Policy Type: ${policyType}`);

      await captureAndAttach(
        page,
        testInfo,
        'Selected Product and Policy Type',
      );

      logger.info(`Clicking Next button`);
      await click(this.nextBtn());

      logger.info(
        `Product and Policy Type selected successfully: ${product}, ${policyType}`,
      );
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
