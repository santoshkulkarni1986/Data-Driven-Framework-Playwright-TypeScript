/***Author
 * Santosh Kulkarni
 * Utility to setup report directories
 */
import fs from 'fs';
import path from 'path';
import logger from './logger';

const folders = [
  'FinalReports/reports/pdf',
  'FinalReports/reports/word',
  'FinalReports/monocart-report',
];

folders.forEach((folder) => {
  const folderPath = path.resolve(folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    logger.info(`Created folder: ${folderPath}`);
  }
});
