import * as xlsx from 'xlsx';
import * as path from 'path';
import ExcelJS from 'exceljs';
import logger from './logger';

export function readExcelfile(filepath: string, sheetName: string): any[] {
  let data: any[] = [];
  try {
    const absolutePath = path.resolve(__dirname, filepath);
    const workbook = xlsx.readFile(absolutePath);
    //const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    data = xlsx.utils.sheet_to_json(sheet, { raw: false });
  } catch (error) {
    logger.error('Failed to read Excel file:', error);
  }
  return data;
}

export async function writeTestResultsToExcel(
  filePath: string,
  sheetName: string,
  testResults: {
    testCase: string;
    status: string;
    Account_number: string;
    Submission_number: string;
    Policy_number: string;
    UWIDescription: string[];
  }[],
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  const maxUWI = Math.max(...testResults.map((r) => r.UWIDescription.length));

  try {
    const baseColumns = [
      { header: 'Test Case Title', key: 'testCase', width: 45 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Account_number', key: 'Account_number', width: 15 },
      { header: 'Submission_number', key: 'Submission_number', width: 15 },
      { header: 'Policy_number', key: 'Policy_number', width: 15 },
    ];

    // Add dynamic UWI columns
    const uwiColumns = Array.from({ length: maxUWI }, (_, i) => ({
      header: `UWI_${i + 1}`,
      key: `UWI_${i + 1}`,
      width: 30,
    }));

    sheet.columns = [...baseColumns, ...uwiColumns];

    testResults.forEach((result) => {
      const row: Record<string, any> = {
        testCase: result.testCase,
        status: result.status,
        Account_number: result.Account_number,
        Submission_number: result.Submission_number,
        Policy_number: result.Policy_number,
      };

      result.UWIDescription.forEach((desc, index) => {
        row[`UWI_${index + 1}`] = desc;
      });

      sheet.addRow(row);
    });

    // sheet.columns = [
    //   { header: "Test Case", key: "testCase", width: 15 },
    //   { header: "Status", key: "status", width: 15 },
    //   //{ header: "First_Name", key: "First_Name", width: 15 },
    //   { header: "Account_number", key: "Account_number", width: 15 },
    //   { header: "Submission_number", key: "Submission_number", width: 15 },
    //   { header: "Policy_number", key: "Policy_number", width: 15 },
    //   { header: "UnderWrite_Question", key: "UWIDescription", width: 50 },
    // ];

    // testResults.forEach((result) => {
    //   sheet.addRow(result);
    // });

    await workbook.xlsx.writeFile(filePath);
  } catch (error) {
    logger.error('Failed to write Excel file:', error);
  }
}

export async function appendTestResultsToExcel(
  filePath: string,
  sheetName: string,
  testResults: {
    testCase: string;
    status: string;
    First_Name: string;
    Account_number: string;
    Submission_number: string;
    Policy_number: string;
  }[],
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  try {
    sheet.columns = [
      { header: 'Test Case', key: 'testCase', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      // { header: "First_Name", key: "First_Name", width: 50 },
      { header: 'Account_number', key: 'Account_number', width: 15 },
      { header: 'Submission_number', key: 'Submission_number', width: 15 },
      { header: 'Policy_number', key: 'Policy_number', width: 50 },
    ];

    testResults.forEach((result) => {
      sheet.addRow(result);
    });

    // Load the existing workbook
    const workbook = xlsx.readFile('example.xlsx');

    // Create new worksheet data
    const newSheetData = [
      ['Name', 'Age', 'City'],
      ['Alice', 30, 'New York'],
      ['Bob', 25, 'Los Angeles'],
    ];

    // Convert data to worksheet
    const newWorksheet = xlsx.utils.aoa_to_sheet(newSheetData);

    // Append the new worksheet to the workbook
    const newSheetName = 'NewSheet';
    xlsx.utils.book_append_sheet(workbook, newWorksheet, newSheetName);

    // Write the updated workbook back to file
    xlsx.writeFile(workbook, 'example.xlsx');
  } catch (error) {
    logger.error('Failed to write Excel file:', error);
  }
}

// public static readCSVFile(sheetname: string) {
//   const csvFilePath = path.join(__dirname,'testdata', 'testData.csv');
//   const fileContent = fs.readFileSync(csvFilePath);
//   const records = parse(fileContent, {
//   columns: true,
//   skip_empty_lines: true
//   });
//   return records;
