"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const image_size_1 = __importDefault(require("image-size"));
const pdfMake = __importStar(require("pdfmake/build/pdfmake"));
const pdfFonts = __importStar(require("pdfmake/build/vfs_fonts"));
const logger_1 = __importDefault(require("./logger"));
pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;
class PDFReporter {
    baseURL = '';
    outputDir;
    screenshotBaseDir;
    constructor(options = {}) {
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
        logger_1.default.info(`📁 PDF output directory: ${this.outputDir}`);
        logger_1.default.info(`📁 Screenshot base directory: ${this.screenshotBaseDir}`);
    }
    onBegin(config) {
        this.baseURL = config.projects[0].use?.baseURL || '';
        // Clear old screenshots
        if (fs.existsSync(this.screenshotBaseDir)) {
            const entries = fs.readdirSync(this.screenshotBaseDir);
            for (const entry of entries) {
                const entryPath = path.join(this.screenshotBaseDir, entry);
                const stats = fs.statSync(entryPath);
                if (stats.isDirectory())
                    fs.rmSync(entryPath, { recursive: true, force: true });
                else
                    fs.unlinkSync(entryPath);
            }
            logger_1.default.info('🧹 Cleared all old screenshots.');
        }
    }
    async onTestEnd(test, result) {
        const content = [
            { text: '📄 Playwright Custom Report', style: 'header' },
            { text: `Base URL: ${this.baseURL}`, margin: [0, 10, 0, 10] },
            { text: `Test Case: ${test.title}`, style: 'subheader' },
            { text: `Overall Status: ${result.status}`, margin: [0, 0, 0, 10] },
        ];
        // Table with step duration
        const tableBody = [
            ['Step', 'Status', 'Duration (s)'],
            ...result.steps.map((step) => [
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
                const dimensions = (0, image_size_1.default)(imageBuffer);
                const aspectRatio = dimensions.height / dimensions.width;
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
        }
        else {
            logger_1.default.warn(`⚠️ No screenshots found for test: ${test.title}`);
        }
        const docDefinition = {
            content,
            styles: {
                header: { fontSize: 18, bold: true },
                subheader: { fontSize: 14, bold: true },
                caption: { fontSize: 12, italics: true },
            },
        };
        const pdfBuffer = await new Promise((resolve) => {
            pdfMake
                .createPdf(docDefinition)
                .getBuffer((buffer) => resolve(buffer));
        });
        const timestamp = new Date()
            .toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })
            .replace(/[/:, ]+/g, '_');
        const pdfPath = path.join(this.outputDir, `${safeTitle}_${timestamp}.pdf`);
        fs.writeFileSync(pdfPath, pdfBuffer);
        logger_1.default.info(`✅ PDF report created: ${pdfPath}`);
    }
}
exports.default = PDFReporter;
