import * as React from "react"
import { MinerSettings, SettingsProps } from "../../lib/settings"
import { Table } from "react-bootstrap"
import { ToastMessage, Message } from "../Common/ToastMessage"
import { MinerRow } from "./MinerRow"
import { MinerInfo } from "../../../../lib/miners/miner"
import { MinerEdit } from "./MinerEdit"
import { Notifications } from "../Notifications/Notifications"

interface Props extends SettingsProps {
}

export const Miners = (props: Props) => {
    const [message, setMessage] = React.useState<Message>({ head: "", text: "" })
    const [minerInfos, setMinerInfos] = React.useState(new Map<string, MinerInfo | null>())
    const [edit, setEdit] = React.useState<MinerSettings | null>(null)

    const handleUpdateMinerInfo = (ip: string, minerInfo: MinerInfo | null) => {
        setMinerInfos((x) => new Map(x.set(ip, minerInfo)))
    }

    const handleCloseEdit = (ip?: string, resetState?: boolean) => {
        setEdit(null)

        if (ip && resetState) {
            handleUpdateMinerInfo(ip, null)
        }
    }

    return (
        <>
            <ToastMessage message={message} />
            <MinerEdit minerSettings={edit} onClose={handleCloseEdit} />
            <Notifications {...props} minerInfos={minerInfos} />
            <Table hover className="my-3">
                <thead>
                    <tr>
                        <th>Майнер</th>
                        <th>IP адрес</th>
                        <th>Имя</th>
                        <th>Статус</th>
                        <th>Текущий хэш</th>
                        <th>Средний хэш</th>
                        <th>Температура</th>
                        <th>Вентиляторы</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {props.settings.miners.length === 0 && (
                        <tr>
                            <td colSpan={9} className="text-center">Для добавления майнеров воспользуйтесь поиском</td>
                        </tr>
                    )}
                    {props.settings.miners.map(minerSettings => (
                        <MinerRow
                            {...props}
                            key={minerSettings.ip}
                            minerSettings={minerSettings}
                            minerInfo={minerInfos.get(minerSettings.ip) || null}
                            updateMinerInfo={handleUpdateMinerInfo}
                            sendMessage={setMessage}
                            onEdit={setEdit}
                        />
                    ))}
                </tbody>
            </Table>
        </>
    )
}