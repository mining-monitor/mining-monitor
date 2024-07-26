import { Request, Response } from "express"
import { io, Socket } from "socket.io-client"
import * as fs from "fs"
import { WebSocketResponse } from "./response"

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
            console.log(`Successfully connect to proxy server ${proxyServer}`);
        })
    },
    get: async (url: string, action: (request: Request, response: Response) => any) => {
        if (!isConnected()) {
            return
        }

        socket!.on(`/get${url}`, (headers: any, query: any, callback: (result: any) => void) => {
            console.log("proxy", "get", url, query)

            const response = new WebSocketResponse()
            action({ headers, query } as Request, (response as any) as Response)

            callback(response.get())
        })
    },
    post: async (url: string, action: (request: Request, response: Response) => any) => {
        if (!isConnected()) {
            return
        }

        socket!.on(`/post${url}`, (headers: any, query: any, body: any, callback: (result: any) => void) => {
            console.log("proxy", "post", url, query, body)

            const response = new WebSocketResponse()
            action({ headers, query, body } as Request, (response as any) as Response)

            callback(response.get())
        })
    },
}

const isConnected = () => {
    return socket !== null
}