import { Request, Response } from "express"
import { io, Socket } from "socket.io-client"
import { WebSocketResponse } from "./response"
import { auth } from "../lib/auth"
import { log } from "../lib/log"
import { settings } from "../lib/settings"
import { events } from "../lib/events"
import { dataBaseEventNames } from "../lib/dataBase"

export interface Proxy {
    connect: () => void,
    reconnect: () => void,
    get: (url: string, action: (request: Request, response: Response) => any) => Promise<any>,
    post: (url: string, action: (request: Request, response: Response) => any) => Promise<any>,
}

let socket: Socket | null = null

interface Event {
    url: string,
    action: (request: Request, response: Response) => Promise<any>,
}

const getEvents: Event[] = []
const postEvents: Event[] = []
let proxyServerCurrent: string | null = null

export const proxy: Proxy = {
    connect: () => {
        const proxyServer = settings.get().proxy
        proxyServerCurrent = proxyServer || null
      
        if (!proxyServer) {
            return
        }

        socket = io(`http://${proxyServer}:8080`)

        socket.on("connect", () => {
            log.info("proxy", `successfully connect to proxy server ${proxyServer}`);
        })

        socket.on("disconnect", () => {
            log.info("proxy", `disconnected from proxy server ${proxyServer}`);
        })
    },
    reconnect: () => {
        const proxyServer = settings.get().proxy
        if (proxyServerCurrent === proxyServer) {
            return
        }

        if (isConnected()) {
            socket!.disconnect()
            socket = null
        }

        proxy.connect()

        if (!isConnected()) {
            return
        }

        getEvents.forEach(x => onGet(x.url, x.action))
        postEvents.forEach(x => onPost(x.url, x.action))
    },
    get: async (url: string, action: (request: Request, response: Response) => Promise<any>) => {
        getEvents.push({ url, action })

        if (!isConnected()) {
            return
        }

        onGet(url, action)
    },
    post: async (url: string, action: (request: Request, response: Response) => Promise<any>) => {
        postEvents.push({ url, action })

        if (!isConnected()) {
            return
        }

        onPost(url, action)
    },
}

events.subscribe({
    event: dataBaseEventNames.get("settings"),
    callback: async () => proxy.reconnect(),
})

const onGet = (url: string, action: (request: Request, response: Response) => Promise<any>) => {
    socket!.on(`/get${url}`, async (headers: any, query: any, callback: (result: any) => void) => {
        await send("get", url, { headers, query } as Request, action, callback)
    })
}

const onPost = (url: string, action: (request: Request, response: Response) => Promise<any>) => {
    socket!.on(`/post${url}`, async (headers: any, query: any, body: any, callback: (result: any) => void) => {
        await send("post", url, { headers, query, body } as Request, action, callback)
    })
}

const send = async (
    method: string,
    url: string,
    request: Request,
    action: (request: Request, response: Response) => Promise<any>,
    callback: (result: any) => void
) => {
    log.debug("proxy", method, url, request.query, request.body)

    const webSocketResponse = new WebSocketResponse()
    const response = (webSocketResponse as any) as Response

    const hasAccess = await auth.checkAuthorization(request.headers.authorization, url)
    if (!hasAccess) {
        log.debug("proxy", method, url, "access denied")
        auth.accessDenied(response)
    } else {
        await action({ ...request, path: url } as Request, response)
    }

    callback(webSocketResponse.get())
}

const isConnected = () => {
    return socket !== null
}