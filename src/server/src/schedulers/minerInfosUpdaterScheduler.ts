import { MinerInfo } from "../../../lib/miners/miner"
import { MinerSettings } from "../../../lib/settings"
import { minerInfos } from "../lib/miners/minerInfos"
import { miners } from "../lib/miners/miners"
import { settings } from "../lib/settings"
import { safeExecute, safeExecuteSync, sleep } from "../lib/utils"

const schedulers = new Map<string, NodeJS.Timeout>()

export const minerInfosUpdaterScheduler = {
    work: () => {
        safeExecuteSync(() => {
            const currentSettings = settings.get()

            currentSettings.miners.forEach(x => {
                if (schedulers.has(x.ip)) {
                    return
                }

                const id = setInterval(() => { updateMinerInfo(x) }, getUpdateInterval())
                schedulers.set(x.ip, id)

                updateMinerInfo(x)
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
        })
    }
}

const updateMinerInfo = async (minerSettings: MinerSettings) => {
    await safeExecute(async () => {
        let minerInfo: MinerInfo | null = null

        for (let i = 0; i < 5; i++) {
            try {
                minerInfo = await miners
                    .get(minerSettings.name)!
                    .getInfo(minerSettings.ip, minerSettings.credentials.login, minerSettings.credentials.password)
            } catch (error) {
                console.error(error)
            }

            if (minerInfo !== null) {
                break
            }

            await sleep(500)
        }

        minerInfos.set(minerSettings.ip, minerInfo)
    })
}

const getUpdateInterval = () => {
    return 9000 + Math.floor(Math.random() * 2000)
}