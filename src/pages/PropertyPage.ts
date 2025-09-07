import { expect, TestInfo, type Page } from '@playwright/test';
import logger from '../Utility/logger';
import { getLocator, getLocatorByRole } from '../Utility/locator-utils';
import { click, selectByText} from '../Utility/action-utils';
import { captureAndAttach } from '../Utility/report-utils';
import { AMSuite_GPAURL } from '../Utility/url-constansts';
import { getPage } from '../Utility/page-utils';
import { isElementVisible } from '../Utility/element-utils';
import {
  NAVIGATION_TIMEOUT,
  TIMEOUT_8_SECONDS,
} from '../Utility/timeout-constants';

export class PropertyPage {
  public readonly getPropertyHeading = getLocator("//h2[text()='Property']");
  public readonly getSelectAddress = getLocator(
    "//select[@name='address.selectedAddress']",
  );
  public readonly getResidenceType = getLocator(
    "//select[@placeholder='-- Choose Residence Type --']",
  );
  public readonly getDwellingOccupied = getLocator(
    "//select[@placeholder='-- Choose dwelling occupied --']",
  );
  public readonly getNextinProperty = getLocator(
    "//button[@class='gw-btn-primary ng-binding']",
  );
  public readonly enterAddressLine1 =
    getLocator('#address-line1').getByRole('textbox');
  public readonly enterCity = getLocator('#city').getByRole('textbox');
  public readonly enterZipcode =
    getLocator('#postal-code').getByRole('textbox');
  public readonly getContinueButton =
    getLocatorByRole('button', { name: 'Continue' }) ||
    getLocator('[ng-click="standardizeAddress(address)"]');
  public readonly getWarningMsg = getLocator(
    '//div[contains(., "The policy address is not a deliverable address according to the US Postal Service. Please verify the address.") and @ng-repeat="war in getMessages(warning.warningMessage) track by $index"]',
  );
  public readonly getVacantWarnMsg = getLocator(
    '//div[@ng-repeat="war in getMessages(warning.warningMessage) track by $index"]',
  ).first();
  public readonly getPopupContinueButton = getLocator(
    "//button[text()='Continue']",
  );
  public readonly getReEnterAddButton = getLocator(
    "//button[text()='Re-Enter Address']",
  );
  public readonly getPopUp = `//div[@class='gw-custom-address-modal ng-scope']`;
  public readonly getChooseReason = getLocator(
    "//select[@ng-model='overrideReasonSelected']",
  );
  public readonly getValuationType = getLocator(
    '[placeholder="-- Choose Valuation Type --"]',
  );

  constructor(private readonly page: Page) {}

  public async selectDwellingOccupied(DwellingOccupied: string): Promise<void> {
    try {
      logger.info(`Selecting Dwelling Occupied: ${DwellingOccupied}`);

      if (await this.getDwellingOccupied.isEnabled()) {
        await this.getDwellingOccupied.waitFor();
        await selectByText(this.getDwellingOccupied, DwellingOccupied);
      }
    } catch (error) {
      logger.error(`Error in selectDwellingOccupied: ${error}`);
      throw error;
    }
  }

  public async enterPropertyDetails(
    testInfo: TestInfo,
    StreetAddress: string,
    City: string,
    zipCode: string,
    ResidenceType: string,
    DwellingOccupied: string,
    propertyData: any,
  ): Promise<void> {
    try {
      logger.info('Executing enterPropertyDetails');

      await this.getPropertyHeading.waitFor({
        state: 'visible',
        timeout: NAVIGATION_TIMEOUT,
      });
      await expect(this.getPropertyHeading).toBeVisible();

      if (StreetAddress != null) {
        await this.getSelectAddress.selectOption({ index: 2 });
        await this.enterAddressLine1.fill(StreetAddress);
        await this.enterCity.scrollIntoViewIfNeeded();
        await this.enterCity.fill(City);
        await this.enterZipcode.fill(zipCode);
        await this.getContinueButton.scrollIntoViewIfNeeded();
        await this.getContinueButton.click({ force: true });
      } else {
        await this.getSelectAddress.selectOption({ index: 1 });
      }

     // await wait(2000);

      if (await isElementVisible(this.getPopupContinueButton)) {
        await this.getPopupContinueButton.click({ force: true });
      } else if (await getPage().isVisible(this.getPopUp)) {
        await click(this.getReEnterAddButton);
        await click(this.getContinueButton);
        await selectByText(this.getChooseReason, 'New Construction');
        await this.getPopupContinueButton.click({ force: true });
      }

     // await wait(TIMEOUT_8_SECONDS);

      await this.getResidenceType.scrollIntoViewIfNeeded();
      await selectByText(this.getResidenceType, ResidenceType);
      await this.getValuationType.selectOption(propertyData['Valuation_Type']);

      await this.selectDwellingOccupied(DwellingOccupied);

      await captureAndAttach(
        this.page,
        testInfo,
        'Entered details in Property page',
      );

      await this.getNextinProperty.scrollIntoViewIfNeeded();
      await this.getNextinProperty.click({ force: true });

     // await wait(TIMEOUT_8_SECONDS);

      if (await isElementVisible(this.getVacantWarnMsg)) {
        await this.getNextinProperty.click({ force: true });
      }

      logger.info('Property details entered successfully');
    } catch (error) {
      logger.error(`Error in enterPropertyDetails: ${error}`);
      throw error;
    }
  }
}
