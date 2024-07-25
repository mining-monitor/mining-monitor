import { MinerInfo } from "../../../../lib/miners/miner"

const infos = new Map<string, MinerInfo | null>()

export const minerInfos = {
    get: (ip:string) => infos.get(ip),
    set: (ip: string, minerInfo: MinerInfo | null) => infos.set(ip, minerInfo),
    delete: (ip: string) => infos.delete(ip),
}