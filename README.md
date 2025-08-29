# Rashmi-QA-AutomationSuite

This project is an automated testing suite using Playwright and TypeScript for end-to-end testing of web applications.

## Project Structure

- `src/` - Source code for helpers, page objects, and setup scripts
- `tests/` - Playwright test specifications
- `Utility/` - Utility functions (actions, assertions, logger, etc.)
- `FinalReports/` - Generated reports (Excel, screenshots, logs, etc.)
- `test-results/` - Playwright and custom test results
- `playwright.config.ts` - Playwright configuration
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm (v8 or higher)

### Installation
1. Clone the repository:
   ```powershell
   git clone <repository-url>
   cd Rashmi-QA-AutomationSuite
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```

### Running Tests
- To run all tests:
  ```powershell
  npx playwright test
  ```
- To run a specific test file:
  ```powershell
  npx playwright test tests/<test-file>.spec.ts
  ```

### Generating Reports
- Playwright HTML report:
  ```powershell
  npx playwright show-report
  ```
- Custom reports are available in the `FinalReports/` directory after test execution.

### Project Scripts
- Add custom scripts in `package.json` as needed for your workflow.

## Folder Details
- `src/pages/` - Page Object Model (POM) classes for application pages
- `src/helper/` - Helper functions and environment types
- `src/setup/` - Global setup/teardown and logger configuration
- `src/testdata/` - Test data files (Excel, TypeScript)
- `Utility/` - Common utilities for actions, assertions, locators, etc.

## Logging
- Logs are stored in `FinalReports/logs/` (app, error, exceptions, rejections)

## Test Data
- Excel files and TypeScript files for test data are in `src/testdata/`

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)