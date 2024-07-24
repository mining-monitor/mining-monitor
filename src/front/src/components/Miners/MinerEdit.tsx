import * as React from "react"
import { MinerSettings } from "../../lib/settings"
import { jasminer } from "../../lib/miners/jasminer"
import { MinerJasminerEdit } from "./Brands/MinerJasminerEdit"
import { Modal, Alert } from "react-bootstrap"

interface Props {
    minerSettings: MinerSettings | null,
    onClose: (ip?: string, resetState?: boolean) => void,
}

export const MinerEdit = (props: Props) => {
    if (!props.minerSettings) {
        return null
    }

    return (
        <Window {...props}>
            {props.minerSettings.name === jasminer.name && (<MinerJasminerEdit {...props} />)}
        </Window>
    )
}

interface WindowProps extends React.PropsWithChildren {
    minerSettings: MinerSettings | null,
    onClose: () => void,
}

const Window = (props: WindowProps) => {
    return (
        <Modal
            show={true}
            onHide={props.onClose}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>Настройка майнера {props.minerSettings.ip}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant="secondary" className="mb-4">
                    Мы рекомендуем редактировать майнеры через их родные интерфейсы.
                    Мы не берем отвественность за проблемы возникшие с майнерами после редактирования через этот интерфейс.
                </Alert>
                {props.children}
            </Modal.Body>
        </Modal>
    )
}