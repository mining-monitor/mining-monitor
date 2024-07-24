import { jasminer } from "./jasminer/jasminer";
import { Miner } from "./miner";

export const miners = new Map<string, Miner>([
    [jasminer.name, jasminer],
])