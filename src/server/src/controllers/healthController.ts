import { Request, Response } from "express"

export const healthController = {
    check: async (_: Request, response: Response) => {
        response.send(new Date().getTime().toString())
    },
}