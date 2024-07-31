"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const winston_1 = __importDefault(require("winston"));
const environment_1 = require("./environment");
environment_1.environment.createDirectory("logs");
const fileFormat = winston_1.default.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} - ${level}: ${message}`;
});
const fileLogger = winston_1.default.createLogger({
    level: "info",
    transports: [
        new winston_1.default.transports.File({
            filename: environment_1.environment.getPath("logs", "desktop-log.txt"),
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), fileFormat),
            maxsize: 10485760,
            maxFiles: 5
        }),
    ],
});
if (process.env.NODE_ENV !== "production") {
    fileLogger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.simple(),
    }));
}
exports.log = {
    info: (...messages) => {
        fileLogger.info(messages.join("\t"));
    }
};
