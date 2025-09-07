import { Page, Locator, expect } from "@playwright/test";
import logger from '../Utility/logger';
import {
  getLocator,
  getLocatorByRole,
} from "../Utility/locator-utils";
import { click, fill, gotoURL, reloadPage } from "../Utility/action-utils";
import { isElementVisible } from "../Utility/element-utils";
import {
  SMALL_TIMEOUT,
  STANDARD_TIMEOUT,
  TIMEOUT_4_SECONDS,
  TIMEOUT_8_SECONDS,
} from "../Utility/timeout-constants";
import { getPage } from "../Utility/page-utils";
import { AMSuite_CoreURL } from "../Utility/url-constansts";

export class RiskAnalysisPage {
  public static submissionNumber: string = "";

  public readonly getUnderWritingIssueMessage = `//gw-displaykey-format[text() = 'There are underwriting issues associated with this offering. ']`;
  public readonly getSubmissionNumberText = `//a[@class = 'gw-highlight ng-binding']`;
  public readonly getPopupforHomePage = `//div[@class='gw-modal__inner']`;
  public readonly getDSText = `//h2[text() = 'Discounts / Surcharges']`;

  public readonly getNextButtoninPolicyDetails: Locator;
  public readonly getPropertyHeading: Locator;
  public readonly getsubmissionSearch: Locator;
  public readonly getsubmissionSearchBtn: Locator;
  public readonly getRiskAnalysisTab: Locator;
  public readonly getFirstApproval: Locator;
  public readonly getApproveBtn: Locator;
  public readonly getApproveOkBtn: Locator;
  public readonly getGpaLinkButton: Locator;
  public readonly getAccountSearchBox: Locator;
  public readonly getSearchButton: Locator;
  public readonly getQuoteNumber: Locator;
  public readonly getContinueQuote: Locator;
  public readonly getYesButtoninPopup: Locator;
  public readonly getNextinProperty: Locator;
  public readonly getNextButton: Locator;
  public readonly getCalculatorButton: Locator;
  public readonly getProceedToIssueButton: Locator;
  public readonly getUWIDescription: Locator;
  public readonly getWarningMsg: Locator;
  public readonly getSaveButtoninCore: Locator;
  public readonly getQuoteButton: Locator;
  public readonly getClearButton: Locator;
  public readonly getResolveButton: Locator;
  public readonly getAlreadyApprovedCheckBox: Locator;
  public readonly getValuationHeading: Locator;
  public readonly getQuoteHeading: Locator;

  constructor(private readonly page: Page) {
    this.getNextButtoninPolicyDetails = getLocator("//button[@ng-click='goToNext()']");
    this.getPropertyHeading = getLocator("//h2[text()='Property']");
    this.getsubmissionSearch = getLocatorByRole("textbox", { name: "Sub #:" });
    this.getsubmissionSearchBtn = getLocator('[id="TabBar\\:PolicyTab\\:PolicyTab_SubmissionNumberSearchItem_Button"]');
    this.getRiskAnalysisTab = getLocator("//div[contains(@class, 'treecolumn')]//span[text()='Risk Analysis']");
    this.getFirstApproval = getLocator("//a[text()='Approve']/parent::div/parent::td/preceding-sibling::td//img[@class='x-grid-checkcolumn']");
    this.getApproveBtn = getLocator('[id="SubmissionWizard:Job_RiskAnalysisScreen:RiskAnalysisCV:RiskEvaluationPanelSet:Approve-btnInnerEl"]');
    this.getApproveOkBtn = getLocator('[id="RiskApprovalDetailsPopup:Update"]');
    this.getGpaLinkButton = getLocator("#image-1013");
    this.getAccountSearchBox = getLocator("//input[@name='SearchParam']");
    this.getSearchButton = getLocator("//span[@class='gw-icon fa fa-search']");
    this.getQuoteNumber = getLocator("//a[@class='gw-action-link ng-binding']");
    this.getContinueQuote = getLocatorByRole("button", { name: "Continue quote" });
    this.getYesButtoninPopup = getLocator("//button[@class='gw-btn gw-btn-primary']");
    this.getNextinProperty = getLocator("//button[@class='gw-btn-primary ng-binding']");
    this.getNextButton = getLocator('//button[@ng-click="next(form)"]');
    this.getCalculatorButton = getLocator("//div[@class='gw-calculate-btn-wrapper gw-displayed']");
    this.getProceedToIssueButton = getLocator("//button[text()='Proceed to Issue']");
    this.getUWIDescription = getLocator('//a[contains(@id,"UWIssueRowSet:ShortDescription")]');
    this.getWarningMsg = getLocator('[ng-repeat="war in getMessages(warning.warningMessage) track by $index"]');
    this.getSaveButtoninCore = getLocator('[id="SubmissionWizard\\:Job_RiskAnalysisScreen\\:JobWizardToolbarButtonSet\\:Draft"]');
    this.getQuoteButton = getLocator('[id="SubmissionWizard\\:Job_RiskAnalysisScreen\\:JobWizardToolbarButtonSet\\:QuoteOrReview"]');
    this.getClearButton = getLocator("//span[text() = 'Clear']");
    this.getResolveButton = getLocator("//span[text()='Resolve']");
    this.getAlreadyApprovedCheckBox = getLocator("//a[text()='Reopen']/parent::div/parent::td/preceding-sibling::td//img[@class='x-grid-checkcolumn x-grid-checkcolumn-checked']");
    this.getValuationHeading = getLocator("//h2[text()='Valuation']");
    this.getQuoteHeading = getLocator("//div[text()='Quote']");
  }

  public async navigatetoCoreAndSearchSubmission(): Promise<string> {
    try {
      logger.info("Executing navigatetoCoreAndSearchSubmission");

     // await wait(STANDARD_TIMEOUT);

      if (await isElementVisible(this.getUnderWritingIssueMessage)) {
        const submissionNumberValue = (await getLocator(this.getSubmissionNumberText).textContent())?.trim();
        logger.info(`Found submissionNumber: ${submissionNumberValue}`);

        await gotoURL(AMSuite_CoreURL);

        if (await isElementVisible(this.getPopupforHomePage)) {
          await this.getYesButtoninPopup.click({ force: true });
        }

        if (await this.getClearButton.isVisible()) {
          await this.getClearButton.click({ force: true });
        }

        await getPage().keyboard.press("Alt+p");

        await click(this.getsubmissionSearch);
        await this.getsubmissionSearch.fill(submissionNumberValue || "");
        await this.getsubmissionSearchBtn.click({ force: true });

        RiskAnalysisPage.submissionNumber = submissionNumberValue || "";
        logger.info(`Set static submissionNumber: ${RiskAnalysisPage.submissionNumber}`);

        return RiskAnalysisPage.submissionNumber;
      }

      return "";
    } catch (error) {
      logger.error(`Error in navigatetoCoreAndSearchSubmission: ${error}`);
      throw error;
    }
  }

  public async RiskAnaysisTab(): Promise<void> {
    try {
      logger.info("Executing RiskAnaysisTab");

      if (await isElementVisible(this.getRiskAnalysisTab)) {
        await this.getRiskAnalysisTab.click({ force: true });

        if (await isElementVisible(this.getFirstApproval.first())) {
          const descriptions = await this.getIssueDescriptions();
          logger.info(`Descriptions found: ${descriptions}`);

          const count = await this.getFirstApproval.count();
          for (let i = 0; i < count; i++) {
            await this.getFirstApproval.first().click({ force: true });
          }

          if (await isElementVisible(this.getAlreadyApprovedCheckBox)) {
            const approvedCount = await this.getAlreadyApprovedCheckBox.count();
            for (let i = 0; i < approvedCount; i++) {
              await this.getAlreadyApprovedCheckBox.click({ force: true });
            }
          }

        
          await click(this.getApproveBtn);
          
          await click(this.getApproveOkBtn);
        }
      }
    } catch (error) {
      logger.error(`Error in RiskAnaysisTab: ${error}`);
      throw error;
    }
  }

  public async RiskAnaysisTabFromIssuanceDWS(): Promise<void> {
    try {
      logger.info("Executing RiskAnaysisTabFromIssuanceDWS");

      const submissionNumberValue = (await getLocator(this.getSubmissionNumberText).textContent())?.trim();
      logger.info(`Submission Number: ${submissionNumberValue}`);

      await gotoURL(AMSuite_CoreURL);
      //await wait(5000);
      await getPage().keyboard.press("Alt+p");
      //await wait(5000);

      await click(this.getsubmissionSearch);
      //await wait(5000);
      await this.getsubmissionSearch.fill(submissionNumberValue || "");
      //await wait(2000);
      await this.getsubmissionSearchBtn.click({ force: true });

      RiskAnalysisPage.submissionNumber = submissionNumberValue || "";

      await this.getRiskAnalysisTab.click({ force: true });
      await reloadPage();
      //await wait(5000);

      if (await isElementVisible(this.getFirstApproval.first())) {
        const descriptions = await this.getIssueDescriptions();
        logger.info(`Descriptions found: ${descriptions}`);

        const count = await this.getFirstApproval.count();
        for (let i = 0; i < count; i++) {
          await this.getFirstApproval.first().click({ force: true });
        }

        if (await isElementVisible(this.getAlreadyApprovedCheckBox)) {
          const approvedCount = await this.getAlreadyApprovedCheckBox.count();
          for (let i = 0; i < approvedCount; i++) {
            await this.getAlreadyApprovedCheckBox.click({ force: true });
          }
        }

        if (count !== 0) {
        //  await wait(5000);
          await click(this.getApproveBtn);
         // await wait(5000);
          await click(this.getApproveOkBtn);
          //await wait(5000);
        }
      }
    } catch (error) {
      logger.error(`Error in RiskAnaysisTabFromIssuanceDWS: ${error}`);
      throw error;
    }
  }

  public async saveAndQuote(): Promise<void> {
    try {
      logger.info("Executing saveAndQuote");

      if (await isElementVisible(this.getSaveButtoninCore)) {
        //await wait(5000);
        await this.getSaveButtoninCore.click({ force: true });
        //await wait(5000);
        await this.getQuoteButton.click({ force: true });
        //await wait(TIMEOUT_8_SECONDS);

        if (await isElementVisible(this.getClearButton)) {
          await this.getClearButton.click({ force: true });
        }

        //await wait(TIMEOUT_4_SECONDS);

        if (await this.getResolveButton.isVisible()) {
          await this.getResolveButton.click({ force: true });

          const count = await this.getFirstApproval.count();
          for (let i = 0; i < count; i++) {
            await this.getFirstApproval.first().click({ force: true });
          }

          //await wait(5000);
          await click(this.getApproveBtn);
         // await wait(5000);
          await click(this.getApproveOkBtn);
          //await wait(5000);

          await this.getSaveButtoninCore.click({ force: true });
          //await wait(5000);
          await this.getQuoteButton.click({ force: true });

          if (await this.getClearButton.isVisible()) {
            await this.getClearButton.click({ force: true });
          }
        }
      }
    } catch (error) {
      logger.error(`Error in saveAndQuote: ${error}`);
      throw error;
    }
  }

  public async navigateToGPA(page: Page): Promise<void> {
    try {
      logger.info("Executing navigateToGPA");

      if (await isElementVisible(this.getGpaLinkButton)) {
        await click(this.getGpaLinkButton);
        await this.getAccountSearchBox.waitFor({ state: "visible", timeout: 12000 });

        logger.info(`Using submission number: ${RiskAnalysisPage.submissionNumber}`);
        await fill(this.getAccountSearchBox, RiskAnalysisPage.submissionNumber || "");
        await page.waitForTimeout(5000);
        await click(this.getSearchButton);
        await click(this.getQuoteNumber);
        await click(this.getContinueQuote);
        await page.waitForTimeout(8000);

        if (await isElementVisible(this.getNextButtoninPolicyDetails)) {
          await page.waitForTimeout(8000);
          await this.getNextButtoninPolicyDetails.click({ force: true });
          //await wait(SMALL_TIMEOUT);

          if (await isElementVisible(this.getWarningMsg)) {
            await this.getNextButtoninPolicyDetails.click({ force: true });
          }

          await page.waitForTimeout(8000);
          await expect(this.getPropertyHeading).toBeVisible();
          await this.getNextinProperty.click({ force: true });
          //await wait(TIMEOUT_8_SECONDS);

          if (!(await isElementVisible(this.getValuationHeading))) {
            await this.getNextinProperty.click({ force: true });
          }

          await page.waitForTimeout(7000);
          await this.getNextButton.click({ force: true });
          //await wait(TIMEOUT_8_SECONDS);

          if (!(await isElementVisible(this.getDSText))) {
            await this.getNextButton.click({ force: true });
          }

          await page.waitForTimeout(5000);
          await this.getNextButton.click({ force: true });
          //await wait(TIMEOUT_8_SECONDS);

          if (!(await isElementVisible(this.getQuoteHeading))) {
            await this.getNextButton.click({ force: true });
          }

          await page.waitForTimeout(10000);

          if (await isElementVisible(this.getDSText)) {
            await page.waitForTimeout(10000);
            await this.getNextButton.click({ force: true });

            if (await isElementVisible(this.getWarningMsg)) {
              await this.getNextButton.click({ force: true });
            }
          }
        }

        await this.getCalculatorButton.click({ force: true });

        if (await isElementVisible(this.getWarningMsg)) {
          await this.getCalculatorButton.click({ force: true });
        }

        await this.getProceedToIssueButton.click({ force: true });
        await page.waitForTimeout(2000);
        await this.getNextButton.click({ force: true });
      }
    } catch (error) {
      logger.error(`Error in navigateToGPA: ${error}`);
      throw error;
    }
  }

  public async getIssueDescriptions(): Promise<string[]> {
    try {
      logger.info("Executing getIssueDescriptions");

      const count = await this.getUWIDescription.count();
      const descriptions: string[] = [];

      for (let i = 0; i < count; i++) {
        descriptions.push((await this.getUWIDescription.nth(i).textContent())?.trim() || "");
      }

      return descriptions;
    } catch (error) {
      logger.error(`Error in getIssueDescriptions: ${error}`);
      throw error;
    }
  }

  public async assertUWIssue(UW_Issue_wording: string): Promise<void> {
    try {
      logger.info("Executing assertUWIssue");

      const expectedDescriptions = UW_Issue_wording
        ? UW_Issue_wording.split(",").map((desc) => desc.trim())
        : [];

      const actualDescriptions = await this.getIssueDescriptions();

      const result = this.arraysHaveSameContent(expectedDescriptions, actualDescriptions);

      expect.soft(result).toBeTruthy();
    } catch (error) {
      logger.error(`Error in assertUWIssue: ${error}`);
      throw error;
    }
  }

  private arraysHaveSameContent<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) return false;

    const countMap = new Map<T, number>();

    for (const item of a) {
      countMap.set(item, (countMap.get(item) || 0) + 1);
    }

    for (const item of b) {
      if (!countMap.has(item)) return false;
      countMap.set(item, countMap.get(item)! - 1);
      if (countMap.get(item)! < 0) return false;
    }

    return true;
  }
}
