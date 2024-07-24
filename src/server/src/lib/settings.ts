import { Settings, settingsKey } from "../../../lib/settings"
import { dataBase } from "./dataBase"

export const settings = {
    get: (): Settings => dataBase.get(settingsKey),
}