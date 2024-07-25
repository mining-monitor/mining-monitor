import { jasminer as jasminerBase, JasminerMiner } from "../../../../lib/miners/jasminer"
import { MinerInfo } from "../../../../lib/miners/miner"
import { Miner } from "./miners"
import { minerRequestsSender } from "./minersRequestsSender"
import { auth } from "../auth"

jasminerBase.setSender(minerRequestsSender)

export const jasminer: JasminerMiner & Miner = {
    ...jasminerBase,
    getInfoFromCache: async (ip: string): Promise<MinerInfo | null> => {
        const result = await fetch(`/miners/info?ip=${ip}`, {
            headers: {
                ...auth.getAuthorization(),
            },
        })

        if (!result.ok) {
            return null
        }

        return await result.json()
    }
}