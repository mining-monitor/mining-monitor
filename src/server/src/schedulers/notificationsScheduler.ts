import { minerInfos } from "../lib/miners/minerInfos"
import { settings } from "../lib/settings"
import { Settings } from "../../../lib/settings"
import { telegram } from "../../../lib/telegram"
import { date } from "../../../lib/date"
import { log } from "../lib/log"
import { safeExecuteSync } from "../lib/utils"

interface NotificationData {
    turnOffDate: Date | null,
}

const notificationsData = new Map<string, NotificationData>()
let lastNotify: Date | null = null

export const notificationsScheduler = {
    work: () => {
        safeExecuteSync(() => {
            const currentSettings = settings.get()

            currentSettings.miners.forEach(x => {
                const value = minerInfos.get(x.ip)

                if (!notificationsData.get(x.ip)) {
                    notificationsData.set(x.ip, { turnOffDate: null })
                    log.info("notificationsScheduler", "addNewIpToData", x.ip)
                }

                if (!value && !notificationsData.get(x.ip)!.turnOffDate) {
                    notificationsData.set(x.ip, { turnOffDate: new Date() })
                    log.info("notificationsScheduler", "minerTurnOff", x.ip)
                }

                if (value && notificationsData.get(x.ip)!.turnOffDate) {
                    notificationsData.set(x.ip, { turnOffDate: null })
                    log.info("notificationsScheduler", "minerTurnOn", x.ip)
                }
            })

            const ips = currentSettings.miners.map(x => x.ip)
            Array.from(notificationsData.keys()).forEach(x => {
                if (ips.indexOf(x) !== -1) {
                    return
                }

                notificationsData.delete(x)
                log.info("notificationsScheduler", "deleteIpFromData", x)
            })

            if (!currentSettings.notifications.enabled) {
                return
            }

            notificationsData.forEach(async (value, key) => {
                if (!value.turnOffDate) {
                    return
                }

                const fromLastNotify = !!lastNotify
                    ? new Date().getTime() - lastNotify.getTime()
                    : Number.MAX_VALUE

                const fromTurnOff = new Date().getTime() - value.turnOffDate.getTime()
                if (fromTurnOff > 5 * 60 * 1000 && fromLastNotify > 15 * 60 * 1000) {
                    await notify(key, value.turnOffDate, currentSettings)
                    lastNotify = new Date()
                }
            })
        })
    }
}

const notify = async (ip: string, turnOffDate: Date, currentSettings: Settings) => {
    log.info("notificationsScheduler", "notify", ip, turnOffDate)

    const miner = currentSettings.miners.find(x => x.ip === ip)!

    await telegram.send(
        `Майнер ${miner.miner} с IP ${miner.ip} не доступен с ${date.format(turnOffDate)}`,
        currentSettings.notifications.telegramBotToken!,
        currentSettings.notifications.telegramBotChatId!
    )
}