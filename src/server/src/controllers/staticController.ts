import { Request, Response } from "express"
import { environment } from "../lib/environment"

export const staticController = {
    index: async (request: Request, response: Response) => {
        await load(request, response, "/dist/index.html")
    },
    mainJs: async (request: Request, response: Response) => {
        await load(request, response, "/dist/main.js")
    },
    updateJs: async (request: Request, response: Response) => {
        await load(request, response, "/dist/update.js")
    },
    favicon: async (request: Request, response: Response) => {
        await load(request, response, "/dist/favicon.ico")
    },
}

const load = async (request: Request, response: Response, file: string) => {
    if (environment.isDebug()) {
        response.sendFile(__dirname + file)
    }
    else {
        const conrent = await fetch(`https://mining-monitor.github.io/mining-monitor/js/dist${request.path}`)
        return response.send(await conrent.text())
    }
}