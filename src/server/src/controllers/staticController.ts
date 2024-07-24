import { Request, Response } from "express"

export const staticController = {
    index: (_: Request, response: Response) => {
        response.sendFile(__dirname + "/dist/index.html")
    },
    mainJs: (_: Request, response: Response) => {
        response.sendFile(__dirname + "/dist/main.js")
    },
    updateJs: (_: Request, response: Response) => {
        response.sendFile(__dirname + "/dist/update.js")
    },
    favicon: (_: Request, response: Response) => {
        response.sendFile(__dirname + "/dist/favicon.ico")
    },
}