/**
 * Playwright PDF Reporter with screenshots
 * Author: Santosh Kulkarni
 */
import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

interface PdfReporterOptions {
  outputFile?: string;
  screenshotDir?: string;
}

class PdfReporter implements Reporter {
  private testResults: {
    testCase: string;
    overallStatus: string;
    totalDuration: string;
    steps: { step: string; status: string; time: string }[];
    screenshots: string[];
  }[] = [];

  private outputFile: string;
  private screenshotDir: string;

  constructor(options: PdfReporterOptions = {}) {
    this.outputFile =
      options.outputFile || path.resolve('FinalReports/reports/pdf/TestReport.pdf');
    this.screenshotDir = options.screenshotDir || path.resolve('FinalReports/reports/pdf/data');

    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // collect test steps
    const steps =
      result.steps?.map((s) => ({
        step: s.title,
        status: s.error ? '❌ Failed' : '✔ Passed',
        time: ((s.duration || 0) / 1000).toFixed(2) + ' s',
      })) || [];

    // collect screenshots for this test (if any)
    let screenshots: string[] = [];
    if (fs.existsSync(this.screenshotDir)) {
      const allFiles = fs.readdirSync(this.screenshotDir);
      const safeTitle = test.title.replace(/[^\w\-]+/g, '_');
      screenshots = allFiles
        .filter((f) => f.includes(safeTitle) && f.toLowerCase().endsWith('.png'))
        .map((f) => path.join(this.screenshotDir, f));
    }

    this.testResults.push({
      testCase: test.title,
      overallStatus: result.status.toUpperCase(),
      totalDuration: ((result.duration || 0) / 1000).toFixed(2) + ' s',
      steps,
      screenshots,
    });
  }

  async onEnd(_result: FullResult) {
    const outputDir = path.dirname(this.outputFile);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const stream = fs.createWriteStream(this.outputFile);
    doc.pipe(stream);

    doc.fontSize(18).text('Playwright Test Execution Report', { align: 'center' });
    doc.moveDown(1.5);

    this.testResults.forEach((result, index) => {
      doc.fontSize(14).text(`Test Case: ${result.testCase}`, { underline: true });
      doc.fontSize(12).text(`Overall Status: ${result.overallStatus}`);
      doc.text(`Total Duration: ${result.totalDuration}`);
      doc.moveDown(0.5);

      // table for steps
      const tableTop = doc.y;
      const rowHeight = 25;
      const colWidths = [250, 100, 120];
      const startX = 50;

      const drawRow = (
        y: number,
        step: { step: string; status: string; time: string } | null,
        isHeader = false
      ) => {
        let x = startX;
        const headers = ['Step', 'Status', 'Time'];
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

      drawRow(tableTop, null, true); // header
      result.steps.forEach((s, i) => drawRow(tableTop + rowHeight * (i + 1), s));

      doc.moveDown(2);

      // add screenshots
      result.screenshots.forEach((screenshotPath) => {
        if (fs.existsSync(screenshotPath)) {
          try {
            doc.addPage();
            doc.fontSize(12).text(`Screenshot: ${path.basename(screenshotPath)}`);
            doc.image(screenshotPath, { width: 400 });
            doc.moveDown(1);
          } catch (err) {
            doc.text(`⚠️ Failed to add screenshot: ${screenshotPath}`);
          }
        }
      });

      if (index < this.testResults.length - 1) doc.addPage();
    });

    doc.end();
    console.log(`✅ PDF Report generated at: ${this.outputFile}`);
  }
}

export default PdfReporter;
