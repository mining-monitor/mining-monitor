import { Request, Response } from "express"
import { dataBase } from "../lib/dataBase"

export const dataController = {
    post: async (request: Request, response: Response) => {
        console.log(request.body)
        console.log(request.query)

        if (!request.body || !request.query.key) {
            return response.sendStatus(400)
        }

        dataBase.set(request.query.key as string, request.body)

        response.send("ok")
    },

    get: async (request: Request, response: Response) => {
        console.log(request.query)

        if (!request.query.key) {
            return response.sendStatus(400)
        }

        const data = dataBase.get(request.query.key as string)
        if (!data) {
            return response.sendStatus(404)
        }

        response.send(data)
    },
}