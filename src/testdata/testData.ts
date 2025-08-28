import { Page, TestInfo } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import logger from '../Utility/logger';

export const LoginCredentials = {
  username: 'autotester',
  password: 'amigp@ss1',
};

export let results: {
  testCase: string;
  status: string;
  Account_number: string;
  Submission_number: string;
  Policy_number: string;
  UWIDescription: string[];
}[] = [];

export const stateAbbreviationMap: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

export function getFullStateName(abbreviation: string): string {
  return stateAbbreviationMap[abbreviation.toUpperCase()] || abbreviation;
}

export function excelDateToString(serial: number): string {
  const excelEpoch = new Date(1899, 11, 30);
  const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export function convertExpiryDate(expiry: string): {
  month: string;
  year: string;
} {
  const [mm, yy] = expiry.split('/');
  const monthNames = [
    '',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const month = monthNames[parseInt(mm, 10)];
  const year = `20${yy}`;
  return { month, year };
}

export const roofCoveringMap: Record<string, string> = {
  'Composition Shingle': 'Shingles, Asphalt/Fiberglass',
  'Wood or Shake Shingle': 'Shakes, Wood',
  Aluminum: 'Aluminum, Corrugated',
  Tin: 'Tin',
  'Heavy Gauge Steel': 'Steel',
  Tile: 'Tile, Clay',
  Copper: 'Copper',
  'Architectural Shingle': 'Shingles, Architectural',
};
export function getRoofCoveringMSB(abbreviation: string): string {
  return roofCoveringMap[abbreviation] || abbreviation;
}

export const roofStyleMap: Record<string, string> = {
  Flat: 'Flat',
  'Slight Pitch': 'Gable, Slight Pitch',
  'Moderate Pitch': 'Gable, Moderate Pitch',
  'Steep Pitch': 'Gable, Steep Pitch',
};
export function getRoofStyleMSB(abbreviation: string): string {
  return roofStyleMap[abbreviation] || abbreviation;
}

export const constructionTypeMap: Record<string, string> = {
  'Brick/Masonry': 'Brick on Masonry',
  Concrete: 'Concrete Block, Painted',
  'Brick Veneer': 'Brick, Solid',
  Frame: 'Brick on Frame',
  Stucco: 'Stucco on Frame',
  Log: 'Logs, Solid',
};
export function getConstructionType_MSB(abbreviation: string): string {
  return constructionTypeMap[abbreviation] || abbreviation;
}

export const heatingMethodMap: Record<string, string> = {
  Electric: 'Heating, Electric',
  'Natural Gas': 'Heating, Gas',
  Propane: 'Heating, Propane Gas Forced Air',
  'Heat Pump': 'Heat Pump',
  'Radiant Ceiling or Floor': 'Heating System, Radiant Floor',
  Oil: 'Heating, Oil',
  Other: 'Heating, Electric',
};
export function getPrimaryHeating_MSB(abbreviation: string): string {
  return heatingMethodMap[abbreviation] || abbreviation;
}

export const foundationTypeMap: Record<string, string> = {
  'Basement - Below Grade': 'Basement, Below Grade',
  'Basement - Walk Out': 'Basement, Walkout',
  'Crawl Space': 'Crawl Space, Unexcavated - Moderate Soil',
  Slab: 'Slab at Grade - Moderate Soil',
  Open: 'Basement, Below Grade',
  Hillside: 'Hillside',
  'Pier and Post/Stilts': 'Piers',
};
export function getFoundationType_MSB(abbreviation: string): string {
  return foundationTypeMap[abbreviation] || abbreviation;
}

export function formatToMMDDYYYY(dateStr: string): string {
  const trimmed = dateStr.trim().replace(/-/g, '/');
  const regex = /^\d{1,2}\/\d{1,2}\/(\d{2}|\d{4})$/;
  if (!regex.test(trimmed)) throw new Error(`Invalid date format: ${dateStr}`);
  const [month, day, yearStr] = trimmed.split('/');
  let year = yearStr.length === 2 ? `19${yearStr}` : yearStr;
  return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
}

let screenshotCounter = 0;

export async function captureAndAttach(
  page: Page,
  testInfo: TestInfo,
  stepName: string,
) {
  screenshotCounter++;

  const timestamp = new Date()
    .toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })
    .replace(/[/:, ]+/g, '_');
  const safeStepName = stepName.replace(/\s+/g, '_');

  // Store all screenshots in root-level /screenshots folder
  const screenshotDir = path.join(
    process.cwd(),
    'FinalReports',
    'reports',
    'pdf',
    'data',
  );
  fs.mkdirSync(screenshotDir, { recursive: true });

  const fileName = `${screenshotCounter}_${safeStepName}_${timestamp}.png`;
  const screenshotPath = path.join(screenshotDir, fileName);

  await page.screenshot({ path: screenshotPath, fullPage: true });

  await testInfo.attach(`Step: ${stepName}`, {
    path: screenshotPath,
    contentType: 'image/png',
  });

  logger.info(`📸 Screenshot saved: ${screenshotPath}`);
}

// Optional: Keep older version if needed
export async function captureAndAttach_old(
  page: Page,
  testInfo: TestInfo,
  stepName: string,
) {
  const screenshot = await page.screenshot({ fullPage: true });
  const timestamp = new Date().toLocaleString('en-GB', {
    timeZone: 'Asia/Kolkata',
  });
  await testInfo.attach(`Step: ${stepName} - ${timestamp}`, {
    body: screenshot,
    contentType: 'image/png',
  });
}
