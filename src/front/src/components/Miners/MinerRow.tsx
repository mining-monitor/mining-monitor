import * as React from "react"
import { SettingsProps } from "../../lib/settings"
import { MinerSettings } from "../../../../lib/settings"
import { Button } from "react-bootstrap"
import { MinerInfo } from "../../../../lib/miners/miner"
import { miners } from "../../lib/miners/miners"
import { Message } from "../Common/ToastMessage"

interface Props extends SettingsProps {
    minerSettings: MinerSettings,
    minerInfo: MinerInfo | null,
    updateMinerInfo: (ip: string, minerInfo: MinerInfo | null) => void,
    sendMessage: (message: Message) => void,
    onEdit: (minerSettings: MinerSettings | null) => void,
}

export const MinerRow = (props: Props) => {
    React.useEffect(() => {
        load()
        const interval = setInterval(() => load(), getLoadInterval())

        return () => clearInterval(interval)
    }, [props.minerSettings])

    const load = async () => {
        const miner = miners.get(props.minerSettings.name)
        const minerInfo = await miner.getInfoFromCache(props.minerSettings.ip)

        props.updateMinerInfo(props.minerSettings.ip, minerInfo)
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
                {props.minerInfo === null && (<span className="text-danger">Не в сети</span>)}
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
    return 2500 + Math.floor(Math.random() * 1000)
}