import { jasminer as jasminerBase, JasminerMiner } from "../../../../lib/miners/jasminer"
import { minerRequestsSender } from "./minersRequestsSender"

jasminerBase.setSender(minerRequestsSender)

export const jasminer: JasminerMiner = {
    ...jasminerBase,
}