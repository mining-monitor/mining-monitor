import winston from "winston"
import { environment } from "./environment"

environment.createDirectory("logs")

const fileFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} - ${level}: ${message}`;
})

const fileLogger = winston.createLogger({
    level: "info",
    transports: [
        new winston.transports.File({
            filename: environment.getPath("logs", "desktop-log.txt"),
            format: winston.format.combine(
                winston.format.timestamp(),
                fileFormat
            ),
            maxsize: 10485760,
            maxFiles: 5
        }),
    ],
})

if (process.env.NODE_ENV !== "production") {
    fileLogger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }))
}

export const log = {
    info: (...messages: string[]) => {
        fileLogger.info(messages.join("\t"))
    }
}