import { MinerSettings } from "../../../lib/settings"
import { minerInfos } from "../lib/miners/minerInfos"
import { miners } from "../lib/miners/miners"
import { settings } from "../lib/settings"

const schedulers = new Map<string, NodeJS.Timeout>()

export const minerInfosUpdaterScheduler = {
    work: () => {
        const currentSettings = settings.get()

        currentSettings.miners.forEach(x => {
            if (schedulers.has(x.ip)) {
                return
            }

            const id = setInterval(() => { updateMinerInfo(x) }, getUpdateInterval())
            schedulers.set(x.ip, id)

        })

        const ips = currentSettings.miners.map(x => x.ip)
        Array.from(schedulers.keys()).forEach(x => {
            if (ips.indexOf(x) !== -1) {
                return
            }

            clearInterval(schedulers.get(x))
            schedulers.delete(x)
            minerInfos.delete(x)
        })
    }
}

const updateMinerInfo = async (minerSettings: MinerSettings) => {
    const minerInfo = await miners
        .get(minerSettings.name)!
        .getInfo(minerSettings.ip, minerSettings.credentials.login, minerSettings.credentials.password)

    console.log("updateMinerInfo", minerSettings, minerInfo)

    minerInfos.set(minerSettings.ip, minerInfo)
}

const getUpdateInterval = () => {
    return 9000 + Math.floor(Math.random() * 2000)
}