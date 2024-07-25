import { jasminer } from "./jasminer";
import { Miner as MinerBase, MinerInfo } from "../../../../lib/miners/miner";

export interface Miner extends MinerBase {
    getInfoFromCache: (ip: string) => Promise<MinerInfo | null>,
}

export const miners: Map<string, Miner> = new Map<string, Miner>([
    [jasminer.name, jasminer],
])

export const minerNames = () => [...miners.keys()]