import {
  Reporter,
  TestCase,
  TestResult,
  TestStep,
  FullConfig,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';
import sizeOf from 'image-size';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import logger from './logger';

(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).vfs;

interface PDFReporterOptions {
  outputDir?: string;
}

class PDFReporter implements Reporter {
  private baseURL: string = '';
  private outputDir: string;
  private screenshotBaseDir: string;

  constructor(options: PDFReporterOptions = {}) {
    this.outputDir =
      options.outputDir ||
      path.join(process.cwd(), 'FinalReports', 'reports', 'pdf');
    this.screenshotBaseDir = path.join(this.outputDir, 'data');

    if (!fs.existsSync(this.screenshotBaseDir)) {
      fs.mkdirSync(this.screenshotBaseDir, { recursive: true });
    }

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    logger.info(`📁 PDF output directory: ${this.outputDir}`);
    logger.info(`📁 Screenshot base directory: ${this.screenshotBaseDir}`);
  }

  onBegin(config: FullConfig) {
    this.baseURL = config.projects[0].use?.baseURL || '';

    // Clear old screenshots
    if (fs.existsSync(this.screenshotBaseDir)) {
      const entries = fs.readdirSync(this.screenshotBaseDir);
      for (const entry of entries) {
        const entryPath = path.join(this.screenshotBaseDir, entry);
        const stats = fs.statSync(entryPath);
        if (stats.isDirectory()) {
          fs.rmSync(entryPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(entryPath);
        }
      }
      logger.info('🧹 Cleared all old screenshots.');
    }
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    const content: any[] = [
      { text: '📄 Playwright Custom Report', style: 'header' },
      { text: `Base URL: ${this.baseURL}`, margin: [0, 10, 0, 10] },
      { text: `Test Case: ${test.title}`, style: 'subheader' },
      { text: `Overall Status: ${result.status}`, margin: [0, 0, 0, 10] },
    ];

    // Table with step duration
    const tableBody = [
      ['Step', 'Status', 'Duration (s)'],
      ...result.steps.map((step: TestStep) => [
        step.title,
        step.error ? '❌ Failed' : '✔ Passed',
        ((step.duration ?? 0) / 1000).toFixed(2),
      ]),
      ['Total Test Duration', '', ((result.duration ?? 0) / 1000).toFixed(2)],
    ];

    content.push({
      table: { body: tableBody, widths: ['*', '*', '*'] },
      layout: 'lightHorizontalLines',
      margin: [0, 10, 0, 10],
    });

    // Attach screenshots for this test
    const safeTitle = test.title.replace(/[^\w\-]+/g, '_');
    const testScreenshotDir = path.join(this.screenshotBaseDir, safeTitle);

    if (fs.existsSync(testScreenshotDir)) {
      const pngFiles = fs
        .readdirSync(testScreenshotDir)
        .filter((f) => f.toLowerCase().endsWith('.png'))
        .sort((a, b) => {
          const aStats = fs.statSync(path.join(testScreenshotDir, a));
          const bStats = fs.statSync(path.join(testScreenshotDir, b));
          return aStats.birthtimeMs - bStats.birthtimeMs;
        });

      for (const file of pngFiles) {
        const imagePath = path.join(testScreenshotDir, file);
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');

        const dimensions = sizeOf(imageBuffer);
        const aspectRatio = dimensions.height! / dimensions.width!;
        const targetWidth = 400;
        const targetHeight = Math.round(targetWidth * aspectRatio);

        content.push({
          text: `Screenshot: ${file}`,
          style: 'caption',
          margin: [0, 10, 0, 5],
        });
        content.push({
          image: `data:image/png;base64,${base64Image}`,
          width: targetWidth,
          height: targetHeight,
          margin: [0, 0, 0, 20],
        });
      }
    } else {
      logger.warn(`⚠️ No screenshots found for test: ${test.title}`);
    }

    const docDefinition = {
      content,
      styles: {
        header: { fontSize: 18, bold: true },
        subheader: { fontSize: 14, bold: true },
        caption: { fontSize: 12, italics: true },
      },
    };

    const pdfBuffer = await new Promise<Buffer>((resolve) =>
      (pdfMake as any).createPdf(docDefinition).getBuffer((buffer: Buffer) => resolve(buffer))
    );

    const timestamp = new Date()
      .toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })
      .replace(/[/:, ]+/g, '_');

    const pdfPath = path.join(this.outputDir, `${safeTitle}_${timestamp}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);
    logger.info(`✅ PDF report created: ${pdfPath}`);
  }
}

export default PDFReporter;
