/**
 * Custom Playwright PDF Reporter
 * Author: Santosh Kulkarni
 */
import {
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import logger from './logger';

interface PdfReporterOptions {
  outputFile?: string;
}

class PdfReporter implements Reporter {
  private testResults: {
    testCase: string;
    overallStatus: string;
    totalDuration: string;
    steps: { step: string; status: string; time: string }[];
  }[] = [];

  private outputFile: string;

  constructor(options: PdfReporterOptions = {}) {
    this.outputFile =
      options.outputFile ||
      path.resolve('FinalReports/reports/pdf/TestReport.pdf');
  }

  // Called after each test
  onTestEnd(test: TestCase, result: TestResult) {
    const steps =
      result.steps?.map((s) => ({
        step: s.title,
        status: s.error ? 'Failed' : 'Passed',
        time: s.duration?.toString() || '0',
      })) || [];

    this.testResults.push({
      testCase: test.title,
      overallStatus: result.status.toUpperCase(),
      totalDuration: `${result.duration} ms`,
      steps,
    });
  }

  // Called after all tests
  async onEnd(_result: FullResult) {
    const outputDir = path.dirname(this.outputFile);
    logger.info(' Generating Playwright PDF report...');
    logger.info(` Result is ${JSON.stringify(_result)}`);
    logger.info(` Output File: ${this.outputFile}`);
    logger.info(` Output Directory: ${outputDir}`);
    logger.info(` Test Results Count: ${this.testResults.length}`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(this.outputFile);
    doc.pipe(stream);

    doc
      .fontSize(18)
      .text('Playwright Test Execution Report', { align: 'center' });
    doc.moveDown(1.5);

    this.testResults.forEach((result, index) => {
      doc
        .fontSize(14)
        .text(`Test Case: ${result.testCase}`, { underline: true });
      doc.fontSize(12).text(`Overall Status: ${result.overallStatus}`);
      doc.text(`Total Test Duration: ${result.totalDuration}`);
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const rowHeight = 25;
      const colWidths = [250, 100, 120];
      const startX = 50;

      const drawRow = (
        y: number,
        step: { step: string; status: string; time: string } | null,
        isHeader = false,
      ) => {
        let x = startX;
        const headers = ['Step', 'Status', 'Time (ms)'];
        const data = step ? [step.step, step.status, step.time] : headers;

        data.forEach((text, i) => {
          const width = colWidths[i];
          doc.rect(x, y, width, rowHeight).stroke();
          doc.fontSize(10);
          doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica');
          doc.text(text, x + 5, y + 8, { width: width - 10, align: 'left' });
          x += width;
        });
      };

      drawRow(tableTop, null, true); // Header
      result.steps.forEach((s, i) =>
        drawRow(tableTop + rowHeight * (i + 1), s),
      );

      doc.moveDown(2);
      if (index < this.testResults.length - 1) doc.addPage();
    });

    doc.end();
    logger.info(`PDF Report generated at: ${this.outputFile}`);
  }
}

export default PdfReporter;
