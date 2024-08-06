import { environment } from "./environment"
import winston from "winston"

environment.createDirectory(".logs")

const fileFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} - ${level}: ${message}`
})

const fileLogger = winston.createLogger({
    level: "debug",
    transports: [
        new winston.transports.File({
            filename: environment.getPath(".logs", "server-log.txt"),
            format: winston.format.combine(
                winston.format.timestamp(),
                fileFormat
            ),
            maxsize: 10485760,
            maxFiles: 5,
        }),
    ],
})

export const log = {
    debug: (message?: any, ...optionalParams: any[]) => {
        if (!environment.isDebug()) {
            return
        }

        console.log(message, ...optionalParams)
        fileLogger.debug(getMessage(message, ...optionalParams))
    },
    info: (message?: any, ...optionalParams: any[]) => {
        console.log(message, ...optionalParams)
        fileLogger.info(getMessage(message, ...optionalParams))
    },
    error: (message?: any, ...optionalParams: any[]) => {
        console.error(message, ...optionalParams)
        fileLogger.error(getMessage(message, ...optionalParams))
    },
}

const getMessage = (message?: any, ...optionalParams: any[]) => {
    if (!message) {
        return ""
    }

    const format = (object: any) => {
        if (typeof object === "object") {
            return JSON.stringify(object)
        }

        return object.toString()
    }

    return [format(message), ...optionalParams.map(x => format(x))].join("\t")
}