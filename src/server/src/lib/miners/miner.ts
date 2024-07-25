import { Miner as MinerBase } from "../../../../lib/miners/miner"

export interface Miner extends MinerBase {
    send: (request: any) => Promise<[object | null, number]>,
}