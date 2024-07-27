import * as React from "react"
import { SettingsProps } from "../../lib/settings"
import { MinerSettings } from "../../../../lib/settings"
import { Button, Card } from "react-bootstrap"
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
    }, [props.minerSettings, props.state])

    const load = async () => {
        if (!props.state.autoUpdate) {
            return
        }

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
                text: `Майнер ${props.minerSettings.ip} успешно отправлен в перезагрузку. Майнер в течении минуты должен пропасть из сети и появиться через несколько минут`,
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
        <>
            <tr className="d-none d-lg-table-row">
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
            <tr className="d-table-row d-lg-none">
                <td colSpan={9}>
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>{props.minerSettings.ip}</Card.Title>
                            <Card.Subtitle className="mb-3 text-muted">{props.minerSettings.miner}</Card.Subtitle>
                            <Card.Text>
                                <div className="row">
                                    <div className="col-4">Имя</div>
                                    <div className="col-8">{props.minerInfo?.poolMiner}</div>
                                </div>
                                <div className="row">
                                    <div className="col-4">Статус</div>
                                    <div className="col-8">
                                        {props.minerInfo !== null && props.minerInfo.dagTime === 100 && (<span className="text-success">В сети</span>)}
                                        {props.minerInfo !== null && props.minerInfo.dagTime !== 100 && (<span className="text-warning" title="Загрузка DAG файла">{props.minerInfo.dagTime}%</span>)}
                                        {props.minerInfo === null && (<span className="text-danger">Не в сети</span>)}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-4">Текущий хэш</div>
                                    <div className="col-8">{props.minerInfo?.currentHash}</div>
                                </div>
                                <div className="row">
                                    <div className="col-4">Средний хэш</div>
                                    <div className="col-8">{props.minerInfo?.avgHash}</div>
                                </div>
                                <div className="row">
                                    <div className="col-4">Температура</div>
                                    <div className="col-8">{props.minerInfo?.temp}</div>
                                </div>
                                <div className="row">
                                    <div className="col-4">Вентиляторы</div>
                                    <div className="col-8">{props.minerInfo?.fanPercent}</div>
                                </div>
                                <div className="mt-3">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        title="Удалить"
                                        className="me-2"
                                        onClick={handleDelete}
                                    >
                                        <i className="bi bi-x-circle"></i> Удалить
                                    </Button>
                                    {!!props.minerInfo && (
                                        <>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                title="Перезагрузить"
                                                className="me-2"
                                                onClick={handleReboot}
                                            >
                                                <i className="bi bi-arrow-clockwise"></i> Перезагрузить
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                title="Настройка"
                                                className="me-2"
                                                onClick={handleEdit}
                                            >
                                                <i className="bi bi-gear-fill"></i> Настройка
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </td>
            </tr>
        </>
    )
}

const getLoadInterval = () => {
    return 2500 + Math.floor(Math.random() * 1000)
}