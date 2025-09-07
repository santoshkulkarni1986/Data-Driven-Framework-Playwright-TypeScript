import {Reporter, TestCase, TestResult, TestStep, FullConfig } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';
import sizeOf from 'image-size';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { AMSuite_GPAURL } from './url-constansts';

pdfMake.vfs = pdfFonts.vfs;

import {Page ,TestInfo } from '@playwright/test';

interface StepResult {
  title: string;
  status: '✔ Passed' | '❌ Failed';
  duration: number;
}

export async function generatePdfReport(
  testInfo: TestInfo,
  steps: StepResult[],
  baseURL: string,
  outputDir = 'pdf-report'
) {
  const content: any[] = [
    { text: '📄 Playwright Custom Report', style: 'header' },
    { text: `Base URL: ${baseURL}`, margin: [0, 10, 0, 10] },
    { text: `Test Case: ${testInfo.title}`, style: 'subheader' },
    { text: `Overall Status: ${testInfo.status}`, margin: [0, 0, 0, 10] },
  ];

  const tableBody = [
    ['Step', 'Status', 'Time Taken (ms)'],
    ...steps.map(step => [step.title, step.status, String(step.duration)]),
    ['Total Test Duration', '', String(testInfo.duration)],
  ];

  content.push({
    table: {
      body: tableBody,
      widths: ['*', '*', '*'],
    },
    layout: 'lightHorizontalLines',
    margin: [0, 10, 0, 10],
  });

  const screenshotDir = path.join(__dirname, '..', 'playwright-report', 'data');
  const files = fs.existsSync(screenshotDir) ? fs.readdirSync(screenshotDir) : [];

  const matchingScreenshots = files.filter(file =>
    file.startsWith('Step') || /\.(png|jpg|jpeg)$/i.test(file)
  );

  for (const file of matchingScreenshots) {
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

  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    pdfMake.createPdf(docDefinition).getBuffer((buffer) => resolve(buffer));
  });

  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `${testInfo.title.replace(/\s+/g, '_')}.pdf`);
  fs.writeFileSync(filePath, pdfBuffer);
  console.log(`✅ PDF report created: ${filePath}`);
}

let screenshotCounter = 0;

export async function captureAndAttach(page: Page, testInfo: TestInfo, stepName: string) {
  screenshotCounter++;
  // Format timestamp for filename
  const timestamp = new Date().toLocaleString('en-GB', {
    timeZone: 'Asia/Kolkata',
  }).replace(/[/:, ]+/g, '_');

  // Sanitize step name
  const safeStepName = stepName.replace(/\s+/g, '_');

  // Create screenshot directory
  const screenshotDirHTML = path.join(__dirname, '..', 'reports', 'data');
  fs.mkdirSync(screenshotDirHTML, { recursive: true });

  // Create screenshot directory
  const screenshotDir = path.join(__dirname, '..', 'reports', 'pdf-report', 'data');
  fs.mkdirSync(screenshotDir, { recursive: true });


  // Build file name and path
  const fileName = `${screenshotCounter}_${safeStepName}.png`;
  const screenshotPath = path.join(screenshotDir, fileName);

  // Capture and save screenshot
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // Attach screenshot to report
  await testInfo.attach(`Step: ${stepName} - ${timestamp}`, {
    path: screenshotPath,
    contentType: 'image/png',
  });
}

