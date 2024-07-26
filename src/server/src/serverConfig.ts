import { Express, Request, Response } from "express"
import { Proxy } from "./proxy/proxy"

let app: Express | null = null
let proxy: Proxy | null = null

export const serverConfig = {
    init: (appConfig: Express, proxyConfig: Proxy) => {
        app = appConfig
        proxy = proxyConfig
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