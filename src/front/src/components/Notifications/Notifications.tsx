import * as React from "react"
import { SettingsProps } from "../../libs/settings"
import { MinerInfo } from "../../libs/miners/miner"
import { telegram } from "../../libs/telegram"
import { date } from "../../libs/date"

interface Props extends SettingsProps {
    minerInfos: Map<string, MinerInfo | null>,
}

interface NotificationData {
    turnOffDate: Date | null,
}

export const Notifications = (props: Props) => {
    const [notificationsData, setNotificationsData] = React.useState(new Map<string, NotificationData>())

    React.useEffect(() => {
        const newNotificationsData = new Map(notificationsData)

        notificationsData.forEach((_, key) => {
            const miner = props.settings.miners.find(x => x.ip === key)
            if (!miner) {
                newNotificationsData.delete(key)
            }
        })

        setNotificationsData(newNotificationsData)

        console.log("Notifications", "miners", newNotificationsData)
    }, props.settings.miners)

    React.useEffect(() => {
        const newNotificationsData = new Map(notificationsData)

        props.minerInfos.forEach((value, key) => {
            if (!newNotificationsData.get(key)) {
                newNotificationsData.set(key, { turnOffDate: null })
            }

            if (!value && !newNotificationsData.get(key).turnOffDate) {
                newNotificationsData.set(key, { turnOffDate: new Date() })
            }

            if (value && newNotificationsData.get(key).turnOffDate) {
                newNotificationsData.set(key, { turnOffDate: null })
            }
        })

        setNotificationsData(newNotificationsData)

        console.log("Notifications", "minerInfos", newNotificationsData)
    }, [props.minerInfos])

    React.useEffect(() => {
        const interval = setInterval(() => notifyIfNeed(), 5000)

        return () => clearInterval(interval)
    }, [notificationsData])

    const notifyIfNeed = async () => {
        if (!props.settings.notifications.telegramBotToken
            || !props.settings.notifications.telegramBotChatId) {
            return
        }

        notificationsData.forEach(async (value, key) => {
            if (!value.turnOffDate) {
                return
            }

            const diff = new Date().getTime() - value.turnOffDate.getTime()
            if (diff > 900000) {
                await notify(key, value.turnOffDate)
            }
        })
    }

    const notify = async (ip: string, turnOffDate: Date) => {
        const miner = props.settings.miners.find(x => x.ip === ip)

        await telegram.send(
            `Майнер ${miner.miner} с IP ${miner.ip} не доступен с ${date.format(turnOffDate)}`,
            props.settings.notifications.telegramBotToken,
            props.settings.notifications.telegramBotChatId
        )
    }

    return (<></>)
}