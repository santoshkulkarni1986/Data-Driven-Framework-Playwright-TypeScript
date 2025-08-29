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
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts'; // npm install pdfmake

pdfMake.vfs = pdfFonts.vfs;
const screenshotDir = path.join(
  __dirname,
  'FinalReports',
  'reports',
  'pdf',
  'data',
);

interface PDFReporterOptions {
  outputDir?: string;
}

class PDFReporter implements Reporter {
  private baseURL: string = '';
  private outputDir: string;

  constructor(options: PDFReporterOptions = {}) {
    this.outputDir = 'FinalReports/reports/pdf/';
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  }

  onBegin(config: FullConfig) {
    this.baseURL = config.projects[0].use?.baseURL || '';

    if (fs.existsSync(screenshotDir)) {
      const entries = fs.readdirSync(screenshotDir);
      for (const entry of entries) {
        const entryPath = path.join(screenshotDir, entry);
        const stats = fs.statSync(entryPath);

        if (stats.isDirectory()) {
          fs.rmSync(entryPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(entryPath);
        }
      }
      console.log(
        '🧹 Cleared all contents inside "data" folder, but kept the folder itself.',
      );
    } else {
      console.log('⚠️ "data" folder does not exist.');
    }
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    const content: any[] = [
      { text: '📄 Playwright Custom Report', style: 'header' },
      { text: `Base URL: ${this.baseURL}`, margin: [0, 10, 0, 10] },
      { text: `Test Case: ${test.title}`, style: 'subheader' },
      { text: `Overall Status: ${result.status}`, margin: [0, 0, 0, 10] },
    ];

    const tableBody = [
      ['Step', 'Status', 'Time Taken (s)'],
      ...result.steps.map((step: TestStep) => [
        step.title,
        step.error ? '❌ Failed' : '✔ Passed',
        String(step.duration / 1000 || 0),
      ]),
      ['Total Test Duration', '', String(result.duration / 1000 || 0)],
    ];

    content.push({
      table: {
        body: tableBody,
        widths: ['*', '*', '*'],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 10, 0, 10],
    });

    const files = fs.readdirSync(screenshotDir);
    let matchingScreenshots = files.filter(
      (file) => file.startsWith('Step') || /\.(png|jpg|jpeg)$/i.test(file),
    );

    //matchingScreenshots.sort();

    // Read all files in the directory
    const allFiles = fs.readdirSync(screenshotDir);

    // Filter only PNG files
    const pngFiles = allFiles.filter((file) =>
      file.toLowerCase().endsWith('.png'),
    );

    // Sort by creation time
    const sortedPngFiles = pngFiles.sort((a, b) => {
      const aStats = fs.statSync(path.join(screenshotDir, a));
      const bStats = fs.statSync(path.join(screenshotDir, b));
      return aStats.birthtimeMs - bStats.birthtimeMs;
    });

    for (const file of sortedPngFiles) {
      const imagePath = path.join(screenshotDir, file);
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

    const docDefinition = {
      content,
      styles: {
        header: { fontSize: 18, bold: true },
        subheader: { fontSize: 14, bold: true },
        caption: { fontSize: 12, italics: true },
      },
    };

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      pdfMake.createPdf(docDefinition).getBuffer((buffer) => {
        resolve(buffer);
      });
    });

    const timestamp = new Date()
      .toLocaleString('en-GB', {
        timeZone: 'Asia/Kolkata',
      })
      .replace(/[/:, ]+/g, '_');
    const filePath = path.join(
      this.outputDir,
      `${test.title.replace(/\s+/g, '_')}_${timestamp}.pdf`,
    );
    fs.writeFileSync(filePath, pdfBuffer);
    console.log(`✅ PDF report created: ${filePath}`);
  }
}

export default PDFReporter;
