import { Express, Request, Response } from "express"
import { Proxy } from "../proxy/proxy"
import { log } from "../lib/log"

let app: Express | null = null
let proxy: Proxy | null = null

export const serverConfig = {
    init: (appConfig: Express, proxyConfig: Proxy) => {
        app = appConfig
        proxy = proxyConfig
        catchErrors()
    },
    get: (url: string, action: (request: Request, response: Response) => Promise<any>) => {
        app!.get(url, action)
        proxy!.get(url, action)
    },
    post: (url: string, action: (request: Request, response: Response) => Promise<any>) => {
        app!.post(url, action)
        proxy!.post(url, action)
    },
}

const catchErrors = () => {
    process.on("uncaughtException", (error) => {
        log.error("Uncaught Exception:", error.message)
        log.error("Uncaught Exception:", error.stack)
        process.exit(1)
    })

    process.on("unhandledRejection", (reason, promise) => {
        log.error("Unhandled Rejection:", reason, promise)
        process.exit(1)
    })
}