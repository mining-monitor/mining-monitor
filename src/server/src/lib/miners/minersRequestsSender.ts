import { MinerRequestsSender } from "../../../../lib/miners/minerRequestsSender"
import { miners } from "./miners"

export const minerRequestsSender: MinerRequestsSender = {
    send: async (body: any, _?: number): Promise<[boolean, string]> => {
        const [result, resultCode] = await miners
            .get(body.miner)!
            .send(body)

        return [resultCode === 200, result || ""]
    }
}

