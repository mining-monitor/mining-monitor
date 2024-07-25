import { jasminer as jasminerBase, JasminerMiner } from "../../../../lib/miners/jasminer"
import { Miner } from "./miners"
import { minerRequestsSender } from "./minersRequestsSender"
import { minerBase } from "./minerBase"

jasminerBase.setSender(minerRequestsSender)

export const jasminer: JasminerMiner & Miner = {
    ...jasminerBase,
    ...minerBase,
}