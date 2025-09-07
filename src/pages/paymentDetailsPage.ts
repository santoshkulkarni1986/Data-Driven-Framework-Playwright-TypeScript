import { expect, TestInfo, type Page } from '@playwright/test';
import logger from '../Utility/logger';
import { getLocator, getLocatorByRole } from '../Utility/locator-utils';
import {
  click,
  fill,
  selectByText,
  scrollLocatorIntoView,
  
} from '../Utility/action-utils';
import { captureAndAttach } from '../Utility/report-utils';
import { getPage } from '../Utility/page-utils';
import { isElementVisible } from '../Utility/element-utils';
import { convertExpiryDate } from '../testdata/testData';
import {
  MAX_TIMEOUT,
  SMALL_TIMEOUT,
  TIMEOUT_4_SECONDS,
  TIMEOUT_8_SECONDS,
} from '../Utility/timeout-constants';

export class PaymentPage {
  public readonly getPaymentMethodDropdownButton = getLocator(
    "//button[@class='gw-btn gw-dropdown-toggle']",
  ).first();
  public readonly getNewPayemntMethod = getLocator(
    "//ul[@class='gw-dropdown-menu payment-details-dropdown']",
  ).first();
  public readonly selectPaymentMethod = getLocator(
    '//select[@gw-pl-select="billingInstrument.selectedPaymentMethod.value"]',
  );
  public readonly getNoSaveforFuture = getLocator(
    "(//div[@class='gw-radios-binary ng-isolate-scope' and @title2='No'])[1]",
  );
  public readonly getNoPayorPrimary = getLocator(
    "(//div[@class='gw-radios-binary ng-isolate-scope' and @title2='No'])[2]",
  );
  public readonly enterRoutingNumber = getLocator('#page-table iframe')
    .contentFrame()
    .locator('#routingNumber');
  public readonly enterAccountNumber = getLocator('#page-table iframe')
    .contentFrame()
    .locator('#accountNumber');
  public readonly getVerifyButton = getLocator('#page-table iframe')
    .contentFrame()
    .getByRole('button', { name: 'Verify' });
  public readonly getCreditCardNameonCard = getLocator('#page-table iframe')
    .contentFrame()
    .locator('#creditCardNameOnCard');
  public readonly getCreditCard = getLocator('#page-table iframe')
    .contentFrame()
    .locator('iframe[name="eProtect-iframe"]')
    .contentFrame()
    .getByRole('textbox', { name: '* Card number' });
  public readonly getExpMonth = getLocator('#page-table iframe')
    .contentFrame()
    .locator('iframe[name="eProtect-iframe"]')
    .contentFrame()
    .getByLabel('Card Expiration Date');
  public readonly getExpYear = getLocator('#page-table iframe')
    .contentFrame()
    .locator('iframe[name="eProtect-iframe"]')
    .contentFrame()
    .locator('#expYear');
  public readonly getOKButton = getLocatorByRole('button', { name: 'Ok' });
  public readonly getFullPayPlan = getLocator('//label[@for="Full Pay Plan"]');
  public readonly getSemiAnnualPayPlan = getLocator(
    '//label[@for="Semi-Annual Pay Plan"]',
  );
  public readonly getQuarterlyPayPlan = getLocator(
    '//label[@for="Quarterly Pay Plan"]',
  );
  public readonly getBiMonthlyPayPlan = getLocator(
    '//label[@for="Bi-Monthly Pay Plan"]',
  );
  public readonly getMonthlyElectronicPay = getLocator(
    '//label[@for="Monthly Electronic Pay Plan"]',
  );
  public readonly getRecurringPaymentMethod = getLocator(
    '[modal="view.paymentsInformation.payNowDetails.selectedRecPaymentToken"]',
  );
  public readonly getElecCheckBox = getLocator(
    '//label[@for="noticeForElecCheck"]',
  );
  public readonly getTraditionalSignRadioButton = getLocatorByRole('heading', {
    name: 'Traditional Signature',
  }).getByRole('radio');
  public readonly getBuyNowButton = getLocatorByRole('button', {
    name: 'Buy Now',
  });
  public readonly getBindingTitle = getLocator(
    "//h1[@class='gw-page-title ng-binding']",
  );
  public readonly getPolicy = getLocator(
    "//div[@class='gw-controls']//a[contains(@href, 'policies')]",
  );
  public readonly getPaynowHeading = getLocator(
    "//h3[contains(text(),'Pay Now Details')]",
  );
  public readonly selectBillingType = getLocator(
    '[ng-model="view.paymentsInformation.billingType.value"]',
  );

  constructor(private readonly page: Page) {}

  public async selectSaveForFutureUse(BillingType: string): Promise<void> {
    try {
      logger.info(
        `Selecting Save For Future Use option for BillingType: ${BillingType}`,
      );

      if (BillingType === 'Invoice') {
        await this.getNoSaveforFuture.scrollIntoViewIfNeeded();
        await this.getNoSaveforFuture.click({ force: true });
        await this.getNoPayorPrimary.click({ force: true });
      } else if (BillingType === 'Recurring Electronic') {
        await this.getNoSaveforFuture.scrollIntoViewIfNeeded();
        await this.getNoSaveforFuture.click({ force: true });
        await this.getNoSaveforFuture.click({ force: true });
        await this.getNoPayorPrimary.click({ force: true });
        await this.getNoPayorPrimary.click({ force: true });
      }
    } catch (error) {
      logger.error(`Error in selectSaveForFutureUse: ${error}`);
      throw error;
    }
  }

  public async selectPaymentPlan(PaymentPlan: string): Promise<void> {
    try {
      logger.info(`Selecting Payment Plan: ${PaymentPlan}`);
      await this.getPaynowHeading.scrollIntoViewIfNeeded();

      if (
        [
          'Semi-Annual Pay Plan',
          'Semi-Annual pay Plan',
          'Semi-Annual pay plan',
        ].includes(PaymentPlan)
      ) {
        await scrollLocatorIntoView(this.getSemiAnnualPayPlan);
        await this.getSemiAnnualPayPlan.click({ force: true });
      } else if (PaymentPlan === 'Quarterly Pay Plan') {
        await scrollLocatorIntoView(this.getQuarterlyPayPlan);
        await this.getQuarterlyPayPlan.click({ force: true });
      } else if (PaymentPlan === 'Bi-Monthly Pay Plan') {
        await scrollLocatorIntoView(this.getBiMonthlyPayPlan);
        await this.getBiMonthlyPayPlan.click({ force: true });
      } else if (PaymentPlan === 'Monthly Electronic Pay Plan') {
        await scrollLocatorIntoView(this.getMonthlyElectronicPay);
        await this.getMonthlyElectronicPay.click({ force: true });
      } else if (PaymentPlan === 'Full Pay Plan') {
        await this.getFullPayPlan.scrollIntoViewIfNeeded();
        await this.getFullPayPlan.click({ force: true });
      }
    } catch (error) {
      logger.error(`Error in selectPaymentPlan: ${error}`);
      throw error;
    }
  }

  public async selectSignature(
    Required_Signature_Forms: string,
  ): Promise<void> {
    try {
      logger.info(`Selecting Signature Form: ${Required_Signature_Forms}`);

      if (Required_Signature_Forms === 'Traditional Signature') {
        await this.getTraditionalSignRadioButton.scrollIntoViewIfNeeded();
        await this.getTraditionalSignRadioButton.check();
      }
    } catch (error) {
      logger.error(`Error in selectSignature: ${error}`);
      throw error;
    }
  }

  public async selectBilling_Method(BillingMethod: string): Promise<void> {
    try {
      logger.info(`Selecting Billing Method: ${BillingMethod}`);
      if (BillingMethod !== 'Direct Bill') {
        await selectByText(this.selectBillingType, BillingMethod);
      }
    } catch (error) {
      logger.error(`Error in selectBilling_Method: ${error}`);
      throw error;
    }
  }

  public async enterPaymentDetails(
    testInfo: TestInfo,
    PaymentMethod: string,
    RountingNum: string,
    AccountNum: string,
    firstName: string,
    CreditCard: any,
    ExpDate: any,
    BillingMethod: string,
    BillingType: string,
    PaymentPlan: string,
    Required_Signature_Forms: string,
  ): Promise<void> {
    try {
      logger.info('Entering Payment Details');

      await this.page.waitForLoadState('load', { timeout: MAX_TIMEOUT });
      await selectByText(this.selectBillingType, BillingType);
   //   await wait(SMALL_TIMEOUT);

      await this.getPaymentMethodDropdownButton.scrollIntoViewIfNeeded();
      await this.getPaymentMethodDropdownButton.click({ force: true });
      await this.getNewPayemntMethod.click({ force: true });
      await selectByText(this.selectPaymentMethod, PaymentMethod);

      await this.selectSaveForFutureUse(BillingType);

      if (PaymentMethod === 'EFT') {
        await this.enterRoutingNumber.click({ force: true });
        await fill(this.enterRoutingNumber, RountingNum.toString());
        await this.enterAccountNumber.click({ force: true });
        await fill(this.enterAccountNumber, AccountNum.toString());
      } else if (PaymentMethod === 'Credit Card') {
        await fill(this.getCreditCardNameonCard, firstName);
        await fill(this.getCreditCard, CreditCard.toString());

        const { month, year } = convertExpiryDate(ExpDate.toString());
        await selectByText(this.getExpMonth, month);
        await selectByText(this.getExpYear, year);
      }

      await this.getVerifyButton.click({ force: true });
      await this.getOKButton.scrollIntoViewIfNeeded();
      await this.getOKButton.click({ force: true });

//      await wait(TIMEOUT_4_SECONDS);

      if (await isElementVisible(this.getOKButton)) {
        await this.getOKButton.click({ force: true });
      }

      if (await this.getRecurringPaymentMethod.isVisible()) {
        await this.getRecurringPaymentMethod.scrollIntoViewIfNeeded();
        await this.getRecurringPaymentMethod.selectOption({ index: 1 });
      }

   //   await wait(TIMEOUT_4_SECONDS);
      await this.selectPaymentPlan(PaymentPlan);
     // await wait(TIMEOUT_4_SECONDS);

      if (await isElementVisible(this.getElecCheckBox)) {
        await this.getElecCheckBox.scrollIntoViewIfNeeded();
        await this.getElecCheckBox.click({ force: true });
      }

      await this.selectSignature(Required_Signature_Forms);

      await captureAndAttach(
        this.page,
        testInfo,
        'Entered details in Payments page',
      );
      await this.getBuyNowButton.scrollIntoViewIfNeeded();
      await this.getBuyNowButton.click({ force: true });

   //   await wait(5000);

      logger.info('Payment details entered successfully');
    } catch (error) {
      logger.error(`Error in enterPaymentDetails: ${error}`);
      throw error;
    }
  }

  public async validatePolicyIssued(testInfo: TestInfo): Promise<void> {
    try {
      logger.info('Validating Policy Issued');
      await this.getBindingTitle.waitFor({ state: 'visible', timeout: 30000 });
      await captureAndAttach(this.page, testInfo, 'Validate Policy Issued');
      await this.getBindingTitle.scrollIntoViewIfNeeded();
      await expect(this.getBindingTitle).toBeVisible();
    } catch (error) {
      logger.error(`Error in validatePolicyIssued: ${error}`);
      throw error;
    }
  }

  public async getPolicyNumberGenerated(): Promise<string> {
    try {
      logger.info('Fetching generated policy number');
      await this.getPolicy.waitFor({ state: 'visible', timeout: 50000 });
      const policy = await this.getPolicy.textContent();
      logger.info(`Policy number generated: ${policy?.toString}`);
      return policy ?? '';
    } catch (error) {
      logger.error(`Error in getPolicyNumberGenerated: ${error}`);
      throw error;
    }
  }
}
