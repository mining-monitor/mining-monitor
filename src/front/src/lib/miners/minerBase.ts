import { MinerInfo } from "../../../../lib/miners/miner"
import { MinerCommon } from "./miners"
import { auth } from "../auth"

export const minerBase: MinerCommon = {
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