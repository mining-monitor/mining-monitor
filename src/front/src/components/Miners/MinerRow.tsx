import * as React from "react"
import { MinerSettings, SettingsProps } from "../../libs/settings"
import { Button } from "react-bootstrap"
import { MinerInfo } from "../../libs/miners/miner"
import { miners } from "../../libs/miners/miners"
import { Message } from "../Common/ToastMessage"
import { sleep } from "../../libs/unils"

interface Props extends SettingsProps {
    minerSettings: MinerSettings,
    minerInfo: MinerInfo | null,
    updateMinerInfo: (ip: string, minerInfo: MinerInfo | null) => void,
    sendMessage: (message: Message) => void,
    onEdit: (minerSettings: MinerSettings | null) => void,
}

export const MinerRow = (props: Props) => {
    const [loadState, setLoadState] = React.useState<"None" | "Loading">("Loading")

    React.useEffect(() => {
        load()
        const interval = setInterval(() => load(), getLoadInterval())

        return () => {
            clearInterval(interval)
            setLoadState("Loading")
        }
    }, [props.minerSettings])

    const load = async () => {
        setLoadState("Loading")

        try {
            let minerInfo: MinerInfo | null = null

            for (let i = 0; i < 5; i++) {
                const miner = miners.get(props.minerSettings.name)
                minerInfo = await miner.getInfo(
                    props.minerSettings.ip,
                    props.minerSettings.credentials.login,
                    props.minerSettings.credentials.password)

                if (minerInfo !== null) {
                    break
                }

                await sleep(500)
            }

            props.updateMinerInfo(props.minerSettings.ip, minerInfo)
        } catch (error) {
            console.error(error)
        }

        setLoadState("None")
    }

    const handleDelete = (event: any) => {
        const newMiners = props.settings.miners.filter(x => x.ip !== props.minerSettings.ip)

        props.onChangeSettings({ ...props.settings, miners: [...newMiners] })
        props.updateMinerInfo(props.minerSettings.ip, null)
    }

    const handleReboot = async (event: any) => {
        const miner = miners.get(props.minerSettings.name)
        const result = await miner.reboot(
            props.minerSettings.ip,
            props.minerSettings.credentials.login,
            props.minerSettings.credentials.password)

        if (result) {
            props.updateMinerInfo(props.minerSettings.ip, null)
            props.sendMessage({
                head: "Перезагрузка майнера",
                text: `Майнер ${props.minerSettings.ip} успешно перезагружен. В течении нескольких минут майнер должен появиться в сети`,
            })
        } else {
            props.sendMessage({
                head: "Перезагрузка майнера",
                text: `Не удалось перезагрузить майнер ${props.minerSettings.ip}`,
            })
        }
    }

    const handleEdit = () => {
        props.onEdit(props.minerSettings)
    }

    return (
        <tr key={props.minerSettings.ip}>
            <td className="text-nowrap" title={props.minerInfo?.sn}>
                {props.minerSettings.miner}
            </td>
            <td className="text-nowrap">
                <a href={`http://${props.minerSettings.ip}`} target="_blank">{props.minerSettings.ip}</a>
            </td>
            <td className="text-nowrap">
                {props.minerInfo?.poolMiner}
            </td>
            <td className="text-nowrap">
                {props.minerInfo !== null && props.minerInfo.dagTime === 100 && (<span className="text-success">В сети</span>)}
                {props.minerInfo !== null && props.minerInfo.dagTime !== 100 && (<span className="text-warning" title="Загрузка DAG файла">{props.minerInfo.dagTime}%</span>)}
                {props.minerInfo === null && loadState === "None" && (<span className="text-danger">Не в сети</span>)}
                {props.minerInfo === null && loadState === "Loading" && (<span className="text-secondary">Загрузка...</span>)}
                {loadState === "None" && (<i className="bi bi-check-lg"></i>)}
                {loadState === "Loading" && (<i className="bi bi-hourglass-split"></i>)}
            </td>
            <td className="text-nowrap">
                {props.minerInfo?.currentHash}
            </td>
            <td className="text-nowrap">
                {props.minerInfo?.avgHash}
            </td>
            <td className="text-nowrap">
                {props.minerInfo?.temp}
            </td>
            <td className="text-nowrap">
                {props.minerInfo?.fanPercent}
            </td>
            <td className="text-nowrap">
                <Button
                    variant="outline-primary"
                    size="sm"
                    className="border-0"
                    title="Удалить"
                    onClick={handleDelete}
                >
                    <i className="bi bi-x-circle"></i>
                </Button>
                {!!props.minerInfo && (
                    <>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="border-0"
                            title="Перезагрузить"
                            onClick={handleReboot}
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                        </Button>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="border-0"
                            title="Настройка"
                            onClick={handleEdit}
                        >
                            <i className="bi bi-gear-fill"></i>
                        </Button>
                    </>
                )}
            </td>
        </tr>
    )
}

const getLoadInterval = () => {
    return 9000 + Math.floor(Math.random() * 2000)
}