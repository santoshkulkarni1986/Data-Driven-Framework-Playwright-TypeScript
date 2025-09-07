import { expect, Page, TestInfo, Locator } from '@playwright/test';
import { captureAndAttach } from '../Utility/report-utils';
import { selectByText, fill } from '../Utility/action-utils';
import { isElementVisible } from '../Utility/element-utils';
import logger from '../Utility/logger';

export class ValuationPage {
  readonly page: Page;
  readonly testInfo: TestInfo;

  // ✅ Locators
  readonly yearBuilt: Locator;
  readonly constructionType: Locator;
  readonly noOfStories: Locator;
  readonly livingSquare: Locator;
  readonly noTownHome: Locator;
  readonly yesTownHome: Locator;
  readonly foundationType: Locator;
  readonly roofCovering: Locator;
  readonly roofStyle: Locator;
  readonly yearOfRoof: Locator;
  readonly primaryHeating: Locator;
  readonly storageTankLocation: Locator;
  readonly estimatedValuation: Locator;
  readonly nextButton: Locator;
  readonly continueBtn: Locator;
  readonly retrieveFromMSB: Locator;
  readonly warningMsg: Locator;
  readonly foundationTypeErrorMsg: Locator;
  readonly fuelStorageTankLocation: Locator;
  readonly describeOtherForPrimaryHeating: Locator;

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;

    // ✅ Initialize locators
    this.yearBuilt = page.getByRole('textbox', { name: 'Year Built *' });
    this.constructionType = page.getByLabel('Construction Type *');
    this.noOfStories = page.locator(
      "(//select[@gw-pl-select='view.construction.storiesNumber.value'])[1]",
    );
    this.livingSquare = page.getByRole('textbox', {
      name: 'Finished Living Area (Sq Ft) *',
    });
    this.noTownHome = page
      .locator("//div[@class='gw-labels']/label[@title='No']")
      .first();
    this.yesTownHome = page.locator('.gw-overlap1').first();
    this.foundationType = page.getByLabel('Foundation Type *');
    this.roofCovering = page.getByLabel('Roof Covering *');
    this.roofStyle = page.getByLabel('Roof Slope/Style *');
    this.yearOfRoof = page.getByRole('textbox', {
      name: 'Year Roof Replaced *',
    });
    this.primaryHeating = page.getByLabel('Primary Heating *');
    this.storageTankLocation = page.getByLabel('Fuel Storage Tank Location *');
    this.estimatedValuation = page.getByRole('textbox', {
      name: 'Estimated Valuation *',
    });
    this.nextButton = page.locator('//button[@ng-click="next(form)"]');
    this.continueBtn = page.getByRole('button', { name: 'Continue' });
    this.retrieveFromMSB = page.getByRole('button', {
      name: 'Retrieve from MSB',
    });
    this.warningMsg = page
      .locator(
        '[ng-repeat="war in getMessages(warning.warningMessage) track by $index"]',
      )
      .first();
    this.foundationTypeErrorMsg = page.locator(
      "//div[contains(@label, 'Foundation Type')]//div[@class='gw-inline-messages']",
    );
    this.fuelStorageTankLocation = page.locator(
      '//div[@label="Fuel Storage Tank Location"]//select',
    );
    this.describeOtherForPrimaryHeating = page.locator(
      '[ng-model="view.construction.primaryHeatingTypeDescription.value"]',
    );
  }

  // ✅ Function 1
  public async selectTownRowOption(option: string) {
    try {
      if (await isElementVisible(this.noTownHome)) {
        if (option === 'Yes') {
          await this.yesTownHome.click({ force: true });
          logger.info('Selected Town/Row: Yes');
        } else {
          await this.noTownHome.click({ force: true });
          logger.info('Selected Town/Row: No');
        }
      }
    } catch (err) {
      logger.error(`Error selecting Town/Row option: ${err}`);
      throw err;
    }
  }

  // ✅ Function 2
  public async selectFoundationType(foundationType: string) {
    try {
      if (await isElementVisible(this.foundationType)) {
        await this.foundationType.scrollIntoViewIfNeeded();
        await selectByText(this.foundationType, foundationType);
        logger.info(`Selected Foundation Type: ${foundationType}`);
      }
    } catch (err) {
      logger.error(`Error selecting foundation type: ${err}`);
      throw err;
    }
  }

  // ✅ Function 3
  public async selectPrimaryHeating(heating: string) {
    try {
      if (await isElementVisible(this.primaryHeating)) {
        await this.primaryHeating.scrollIntoViewIfNeeded();
        await selectByText(this.primaryHeating, heating);
        logger.info(`Selected Primary Heating: ${heating}`);

        if (heating === 'Oil' || heating === 'Propane') {
          await this.storageTankLocation.selectOption({ index: 1 });
          logger.info('Selected Storage Tank Location (index 1)');
        }

        if (await isElementVisible(this.describeOtherForPrimaryHeating)) {
          await fill(this.describeOtherForPrimaryHeating, 'Solar Power');
          logger.info('Filled Other Primary Heating as Solar Power');
        }
      }
    } catch (err) {
      logger.error(`Error selecting Primary Heating: ${err}`);
      throw err;
    }
  }

  // ✅ Function 4
  public async enterEstimatedValuation(value: string) {
    try {
      if (await isElementVisible(this.estimatedValuation)) {
        await this.estimatedValuation.scrollIntoViewIfNeeded();
        await fill(
          this.estimatedValuation,
          value.toString().replace(/[$,]/g, ''),
        );
        logger.info(`Entered Estimated Valuation: ${value}`);
      }
    } catch (err) {
      logger.error(`Error entering Estimated Valuation: ${err}`);
      throw err;
    }
  }

  // ✅ Function 5
  public async enterValuationDetails(data: any) {
    try {
      await fill(this.yearBuilt, data.yearBuilt.toString());
      await selectByText(this.constructionType, data.constructionType);
      await selectByText(this.noOfStories, data.NumOfStories.toString());
      await fill(
        this.livingSquare,
        data.LivingArea.toString().replace(/,/g, ''),
      );
      await this.selectTownRowOption(data.townRow);
      await this.selectFoundationType(data.foundationType);
      await selectByText(this.roofCovering, data.roofCovering);
      await selectByText(this.roofStyle, data.roofStyle);
      await fill(this.yearOfRoof, data.RoofYear.toString());
      await this.selectPrimaryHeating(data.PrimaryHeating);
      await this.enterEstimatedValuation(data.estimatedValuation);

      await captureAndAttach(
        this.page,
        this.testInfo,
        'Enter details in valuation page - 1',
      );

      await this.nextButton.click({ force: true });
      if (await isElementVisible(this.warningMsg)) {
        await this.nextButton.click({ force: true });
        logger.warn('Warning detected, retried clicking Next button');
      }

      logger.info('Successfully filled valuation details');
    } catch (err) {
      logger.error(`Error entering valuation details: ${err}`);
      throw err;
    }
  }

  // ✅ Function 6
  public async enterDWSValuationDetails(data: any) {
    try {
      await fill(this.yearBuilt, data.yearBuilt.toString());
      await selectByText(this.constructionType, data.constructionType);
      await selectByText(this.noOfStories, data.NumOfStories.toString());
      await fill(
        this.livingSquare,
        data.LivingArea.toString().replace(/,/g, ''),
      );
      await this.selectTownRowOption(data.townRow);
      await this.selectFoundationType(data.foundationType);
      await selectByText(this.roofCovering, data.roofCovering);
      await selectByText(this.roofStyle, data.roofStyle);
      await fill(this.yearOfRoof, data.RoofYear.toString());
      await this.selectPrimaryHeating(data.PrimaryHeating);
      await this.enterEstimatedValuation(data.estimatedValuation);

      await captureAndAttach(
        this.page,
        this.testInfo,
        'Enter details in valuation page - DWS',
      );

      await this.continueBtn.click({ force: true });
      logger.info('Successfully filled DWS valuation details');
    } catch (err) {
      logger.error(`Error entering DWS valuation details: ${err}`);
      throw err;
    }
  }

  // ✅ Function 7
  public async clickNextButton() {
    try {
      await this.nextButton.click({ force: true });
      logger.info('Clicked Next button');
    } catch (err) {
      logger.error(`Error clicking Next button: ${err}`);
      throw err;
    }
  }

  // ✅ Function 8
  public async clickContinueButton() {
    try {
      await this.continueBtn.click({ force: true });
      logger.info('Clicked Continue button');
    } catch (err) {
      logger.error(`Error clicking Continue button: ${err}`);
      throw err;
    }
  }

  // ✅ Function 9
  public async clickRetrieveFromMSB() {
    try {
      await this.retrieveFromMSB.click({ force: true });
      logger.info('Clicked Retrieve from MSB button');
    } catch (err) {
      logger.error(`Error clicking Retrieve from MSB: ${err}`);
      throw err;
    }
  }

  // ✅ Function 10
  public async validateFoundationTypeError(expectedMsg: string) {
    try {
      const actualMsg = await this.foundationTypeErrorMsg.textContent();
      expect(actualMsg?.trim()).toBe(expectedMsg);
      logger.info('Validated Foundation Type Error message successfully');
    } catch (err) {
      logger.error(`Error validating Foundation Type Error: ${err}`);
      throw err;
    }
  }
}
