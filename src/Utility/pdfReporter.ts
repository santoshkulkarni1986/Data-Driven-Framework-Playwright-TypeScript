import {
  Reporter,
  TestCase,
  TestResult,
  TestStep,
  FullConfig,
} from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';
import sizeOf from 'image-size';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).vfs;

interface PDFReporterOptions {
  outputDir?: string;
}

export default class PDFReporter implements Reporter {
  private outputDir: string;
  private screenshotBaseDir: string;
  private baseURL: string = '';

  constructor(options: PDFReporterOptions = {}) {
    this.outputDir =
      options.outputDir || path.join(process.cwd(), 'FinalReports', 'reports', 'pdf');
    this.screenshotBaseDir = path.join(this.outputDir, 'data');

    if (!fs.existsSync(this.screenshotBaseDir)) fs.mkdirSync(this.screenshotBaseDir, { recursive: true });
    if (!fs.existsSync(this.outputDir)) fs.mkdirSync(this.outputDir, { recursive: true });

    console.log(`📁 PDF output directory: ${this.outputDir}`);
  }

  onBegin(config: FullConfig) {
    this.baseURL = config.projects[0].use?.baseURL || '';

    // Clean old screenshots
    if (fs.existsSync(this.screenshotBaseDir)) {
      fs.rmSync(this.screenshotBaseDir, { recursive: true, force: true });
    }
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    const content: any[] = [
      { text: '📄 Playwright PDF Report', style: 'header' },
      { text: `Base URL: ${this.baseURL}`, margin: [0, 10, 0, 10] },
      { text: `Test: ${test.title}`, style: 'subheader' },
      { text: `Status: ${result.status}`, margin: [0, 0, 0, 10] },
    ];

    const tableBody = [
      ['Step', 'Status', 'Duration (s)'],
      ...result.steps.map((step: TestStep) => [
        step.title,
        step.error ? '❌ Failed' : '✔ Passed',
        ((step.duration ?? 0) / 1000).toFixed(2),
      ]),
      ['Total Duration', '', ((result.duration ?? 0) / 1000).toFixed(2)],
    ];

    content.push({ table: { body: tableBody, widths: ['*', '*', '*'] }, layout: 'lightHorizontalLines', margin: [0, 10, 0, 10] });

    // Add screenshots if present
    const safeTitle = test.title.replace(/[^\w\-]+/g, '_');
    const screenshotDir = path.join(this.screenshotBaseDir, safeTitle);
    if (fs.existsSync(screenshotDir)) {
      const pngFiles = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
      for (const file of pngFiles) {
        const imageBuffer = fs.readFileSync(path.join(screenshotDir, file));
        const base64Image = imageBuffer.toString('base64');
        const dims = sizeOf(imageBuffer);
        const aspect = dims.height! / dims.width!;
        const targetWidth = 400;
        const targetHeight = targetWidth * aspect;

        content.push({ text: `Screenshot: ${file}`, style: 'caption', margin: [0, 10, 0, 5] });
        content.push({ image: `data:image/png;base64,${base64Image}`, width: targetWidth, height: targetHeight, margin: [0, 0, 0, 20] });
      }
    }

    const pdfDef = {
      content,
      styles: { header: { fontSize: 18, bold: true }, subheader: { fontSize: 14, bold: true }, caption: { fontSize: 12, italics: true } },
    };

    const pdfBuffer = await new Promise<Buffer>((resolve) => (pdfMake as any).createPdf(pdfDef).getBuffer(resolve));
    const timestamp = new Date().toISOString().replace(/[:.]/g, '_');
    fs.writeFileSync(path.join(this.outputDir, `${safeTitle}_${timestamp}.pdf`), pdfBuffer);
  }
}
