import { Request, Response } from "express"

export const staticController = {
    index: async (_: Request, response: Response) => {
        response.sendFile(__dirname + "/dist/index.html")
    },
    mainJs: async (_: Request, response: Response) => {
        response.sendFile(__dirname + "/dist/main.js")
    },
    updateJs: async (_: Request, response: Response) => {
        response.sendFile(__dirname + "/dist/update.js")
    },
    favicon: async (_: Request, response: Response) => {
        response.sendFile(__dirname + "/dist/favicon.ico")
    },
}