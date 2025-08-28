"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var image_size_1 = require("image-size");
var pdfMake = require("pdfmake/build/pdfmake");
var pdfFonts = require("pdfmake/build/vfs_fonts");
var logger_1 = require("./logger");
pdfMake.vfs = ((_a = pdfFonts.pdfMake) === null || _a === void 0 ? void 0 : _a.vfs) || pdfFonts.vfs;
var PDFReporter = /** @class */ (function () {
    function PDFReporter(options) {
        if (options === void 0) { options = {}; }
        this.baseURL = '';
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
        logger_1.default.info("\uD83D\uDCC1 PDF output directory: ".concat(this.outputDir));
        logger_1.default.info("\uD83D\uDCC1 Screenshot base directory: ".concat(this.screenshotBaseDir));
    }
    PDFReporter.prototype.onBegin = function (config) {
        var _a;
        this.baseURL = ((_a = config.projects[0].use) === null || _a === void 0 ? void 0 : _a.baseURL) || '';
        // Clear old screenshots
        if (fs.existsSync(this.screenshotBaseDir)) {
            var entries = fs.readdirSync(this.screenshotBaseDir);
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var entry = entries_1[_i];
                var entryPath = path.join(this.screenshotBaseDir, entry);
                var stats = fs.statSync(entryPath);
                if (stats.isDirectory())
                    fs.rmSync(entryPath, { recursive: true, force: true });
                else
                    fs.unlinkSync(entryPath);
            }
            logger_1.default.info('🧹 Cleared all old screenshots.');
        }
    };
    PDFReporter.prototype.onTestEnd = function (test, result) {
        return __awaiter(this, void 0, void 0, function () {
            var content, tableBody, safeTitle, testScreenshotDir, pngFiles, _i, pngFiles_1, file, imagePath, imageBuffer, base64Image, dimensions, aspectRatio, targetWidth, targetHeight, docDefinition, pdfBuffer, timestamp, pdfPath;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        content = [
                            { text: '📄 Playwright Custom Report', style: 'header' },
                            { text: "Base URL: ".concat(this.baseURL), margin: [0, 10, 0, 10] },
                            { text: "Test Case: ".concat(test.title), style: 'subheader' },
                            { text: "Overall Status: ".concat(result.status), margin: [0, 0, 0, 10] },
                        ];
                        tableBody = __spreadArray(__spreadArray([
                            ['Step', 'Status', 'Duration (s)']
                        ], result.steps.map(function (step) {
                            var _a;
                            return [
                                step.title,
                                step.error ? '❌ Failed' : '✔ Passed',
                                (((_a = step.duration) !== null && _a !== void 0 ? _a : 0) / 1000).toFixed(2),
                            ];
                        }), true), [
                            ['Total Test Duration', '', (((_a = result.duration) !== null && _a !== void 0 ? _a : 0) / 1000).toFixed(2)],
                        ], false);
                        content.push({
                            table: { body: tableBody, widths: ['*', '*', '*'] },
                            layout: 'lightHorizontalLines',
                            margin: [0, 10, 0, 10],
                        });
                        safeTitle = test.title.replace(/[^\w\-]+/g, '_');
                        testScreenshotDir = path.join(this.screenshotBaseDir, safeTitle);
                        if (fs.existsSync(testScreenshotDir)) {
                            pngFiles = fs
                                .readdirSync(testScreenshotDir)
                                .filter(function (f) { return f.toLowerCase().endsWith('.png'); })
                                .sort(function (a, b) {
                                var aStats = fs.statSync(path.join(testScreenshotDir, a));
                                var bStats = fs.statSync(path.join(testScreenshotDir, b));
                                return aStats.birthtimeMs - bStats.birthtimeMs;
                            });
                            for (_i = 0, pngFiles_1 = pngFiles; _i < pngFiles_1.length; _i++) {
                                file = pngFiles_1[_i];
                                imagePath = path.join(testScreenshotDir, file);
                                imageBuffer = fs.readFileSync(imagePath);
                                base64Image = imageBuffer.toString('base64');
                                dimensions = (0, image_size_1.default)(imageBuffer);
                                aspectRatio = dimensions.height / dimensions.width;
                                targetWidth = 400;
                                targetHeight = Math.round(targetWidth * aspectRatio);
                                content.push({
                                    text: "Screenshot: ".concat(file),
                                    style: 'caption',
                                    margin: [0, 10, 0, 5],
                                });
                                content.push({
                                    image: "data:image/png;base64,".concat(base64Image),
                                    width: targetWidth,
                                    height: targetHeight,
                                    margin: [0, 0, 0, 20],
                                });
                            }
                        }
                        else {
                            logger_1.default.warn("\u26A0\uFE0F No screenshots found for test: ".concat(test.title));
                        }
                        docDefinition = {
                            content: content,
                            styles: {
                                header: { fontSize: 18, bold: true },
                                subheader: { fontSize: 14, bold: true },
                                caption: { fontSize: 12, italics: true },
                            },
                        };
                        return [4 /*yield*/, new Promise(function (resolve) {
                                pdfMake
                                    .createPdf(docDefinition)
                                    .getBuffer(function (buffer) { return resolve(buffer); });
                            })];
                    case 1:
                        pdfBuffer = _b.sent();
                        timestamp = new Date()
                            .toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })
                            .replace(/[/:, ]+/g, '_');
                        pdfPath = path.join(this.outputDir, "".concat(safeTitle, "_").concat(timestamp, ".pdf"));
                        fs.writeFileSync(pdfPath, pdfBuffer);
                        logger_1.default.info("\u2705 PDF report created: ".concat(pdfPath));
                        return [2 /*return*/];
                }
            });
        });
    };
    return PDFReporter;
}());
exports.default = PDFReporter;
