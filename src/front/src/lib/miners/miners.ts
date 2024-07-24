import { jasminer } from "./jasminer";
import { Miner } from "../../../../lib/miners/miner";

export const miners: Map<string, Miner> = new Map<string, Miner>([
    [jasminer.name, jasminer],
])

export const minerNames = () => [...miners.keys()]