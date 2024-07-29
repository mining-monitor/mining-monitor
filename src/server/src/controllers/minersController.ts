import { Request, Response } from "express"
import { minerInfos } from "../lib/miners/minerInfos"
import { log } from "../lib/log"

export const minersController = {
    getInfo: async (request: Request, response: Response) => {
        log.debug("minersController", "getInfo", request.query)

        if (!request.query.ip) {
            return response.sendStatus(400)
        }

        const minerInfo = minerInfos.get(request.query.ip as string)
        if (minerInfo == null) {
            return response.sendStatus(404)
        }

        response.send(minerInfo)
    }
}