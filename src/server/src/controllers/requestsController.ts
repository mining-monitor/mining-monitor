import { Request, Response } from "express"
import { miners } from "../lib/miners/miners"
import { log } from "../lib/log"

export const requestsController = {
    send: async (request: Request, response: Response) => {
        log.debug("requestsController", "send", request.body)

        if (!request.body || !request.body.miner) {
            return response.sendStatus(400)
        }

        const [result, resultCode] = await miners
            .get(request.body.miner)!
            .send(request.body)

        if (resultCode !== 200) {
            return response.sendStatus(resultCode)
        }

        response.send(result)
    },
}