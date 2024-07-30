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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webServerRunner = void 0;
const child_process_1 = require("child_process");
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const electron_fetch_1 = __importDefault(require("electron-fetch"));
exports.webServerRunner = {
    run: (onSuccess) => __awaiter(void 0, void 0, void 0, function* () {
        createDirectory("");
        createDirectory("dist");
        console.log("Start load files");
        yield Promise.all([
            loadFile("https://mining-monitor.github.io/mining-monitor/js/server.js", "server.js"),
            loadFile("https://mining-monitor.github.io/mining-monitor/js/dist/favicon.ico", "dist", "favicon.ico"),
            loadFile("https://mining-monitor.github.io/mining-monitor/js/dist/index.html", "dist", "index.html"),
            loadFile("https://mining-monitor.github.io/mining-monitor/js/dist/main.js", "dist", "main.js"),
            loadFile("https://mining-monitor.github.io/mining-monitor/js/dist/update.js", "dist", "update.js")
        ]);
        console.log("Start application");
        commandLine(`node ${getPath("server.js")}`);
        console.log("Application is running");
        setTimeout(onSuccess, 5000);
    }),
};
const createDirectory = (...paths) => {
    const directoryPath = getPath(...paths);
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }
};
const loadFile = (url, ...paths) => __awaiter(void 0, void 0, void 0, function* () {
    const filePath = getPath(...paths);
    const result = yield (yield (0, electron_fetch_1.default)(url)).text();
    fs.writeFileSync(filePath, result);
});
const commandLine = (message) => (0, child_process_1.exec)(message, { cwd: getPath(""), maxBuffer: 1024 * 1024 * 1024 * 1024 }, execCallback);
const getPath = (...paths) => path.join(os.homedir(), ".mining-monitor", ...paths);
const execCallback = (error, stdout, stderr) => {
    const dubug = false;
    if (error && dubug) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr && dubug) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    dubug && console.log(`stdout: ${stdout}`);
};
