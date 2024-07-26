import { Request, Response } from "express"
import { io, Socket } from "socket.io-client"
import * as fs from "fs"
import { WebSocketResponse } from "./response"
import { auth } from "../lib/auth"

export interface Proxy {
    connect: () => void,
    get: (url: string, action: (request: Request, response: Response) => any) => Promise<any>,
    post: (url: string, action: (request: Request, response: Response) => any) => Promise<any>,
}

const proxyServerFile = "proxy-server"
let socket: Socket | null = null

export const proxy: Proxy = {
    connect: () => {
        if (!fs.existsSync(proxyServerFile)) {
            return
        }

        const proxyServer = fs.readFileSync(proxyServerFile).toString()
        socket = io(proxyServer)

        socket.on("connect", () => {
            console.log("proxy", `successfully connect to proxy server ${proxyServer}`);
        })
    },
    get: async (url: string, action: (request: Request, response: Response) => Promise<any>) => {
        if (!isConnected()) {
            return
        }

        socket!.on(`/get${url}`, async (headers: any, query: any, callback: (result: any) => void) => {
            await send("get", url, { headers, query } as Request, action, callback)
        })
    },
    post: async (url: string, action: (request: Request, response: Response) => Promise<any>) => {
        if (!isConnected()) {
            return
        }

        socket!.on(`/post${url}`, async (headers: any, query: any, body: any, callback: (result: any) => void) => {
            await send("post", url, { headers, query, body } as Request, action, callback)
        })
    },
}

const send = async (
    method: string,
    url: string,
    request: Request,
    action: (request: Request, response: Response) => Promise<any>,
    callback: (result: any) => void
) => {
    console.log("proxy", method, url, request.query, request.body, request.headers.authorization)

    const webSocketResponse = new WebSocketResponse()
    const response = (webSocketResponse as any) as Response

    const hasAccess = await auth.checkAuthorization(request.headers.authorization, url)
    if (!hasAccess) {
        console.log("proxy", method, url, "access denied")
        auth.accessDenied(response)
    } else {
        await action({ ...request, path: url } as Request, response)
    }

    callback(webSocketResponse.get())
}

const isConnected = () => {
    return socket !== null
}