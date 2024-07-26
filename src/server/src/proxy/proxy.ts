import { Request, Response } from "express"
import { io, Socket } from "socket.io-client"
import * as fs from "fs"

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

        socket!.on(`/get${url}`, (body: any, callback: (result: any) => void) => {
            console.log(url, body)
            callback({ result: "reseived get" })
        })
    },
    post: async (url: string, action: (request: Request, response: Response) => any) => {
        if (!isConnected()) {
            return
        }

        socket!.on(`/post${url}`, (body: any, callback: (result: any) => void) => {
            console.log(url, body)
            callback({ result: "reseived post" })
        })
    },
}

const isConnected = () => {
    return socket !== null
}