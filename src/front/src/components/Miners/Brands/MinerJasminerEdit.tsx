import * as React from "react"
import { MinerSettings } from "../../../../../lib/settings"
import { Form, Button, InputGroup, ProgressBar } from "react-bootstrap"
import { EditData, jasminer } from "../../../../../lib/miners/jasminer"
import { sleep } from "../../../lib/utils"

interface Props {
    minerSettings: MinerSettings,
    onClose: (ip?: string, resetState?: boolean) => void,
}

export const MinerJasminerEdit = (props: Props) => {
    const [editData, setEditData] = React.useState<EditData | null>(null)
    const [saving, setSaving] = React.useState(false)

    React.useEffect(() => {
        load()

        return () => setEditData(null)
    }, [props.minerSettings])

    const load = async () => {
        const newEditData = await jasminer.loadEdit(
            props.minerSettings.ip,
            props.minerSettings.credentials.login,
            props.minerSettings.credentials.password)

        setEditData(newEditData)
    }

    const handleChange = (event: any) => {
        setEditData(x => ({
            ...x,
            [event.target.name]: event.target.value,
        }))
    }

    const handleSave = async () => {
        setSaving(true)

        try {
            await jasminer.edit(
                props.minerSettings.ip,
                props.minerSettings.credentials.login,
                props.minerSettings.credentials.password,
                editData)
        } catch (error) {
            console.error(error)
        }

        setSaving(false)
        props.onClose()
    }

    const handleSaveAndResetState = async () => {
        setSaving(true)

        try {
            await jasminer.edit(
                props.minerSettings.ip,
                props.minerSettings.credentials.login,
                props.minerSettings.credentials.password,
                editData)

            await sleep(500)

            await jasminer.reboot(
                props.minerSettings.ip,
                props.minerSettings.credentials.login,
                props.minerSettings.credentials.password)
        } catch (error) {
            console.error(error)
        }

        setSaving(false)
        props.onClose(props.minerSettings.ip, true)
    }

    const handleClose = () => props.onClose()

    if (!editData) {
        return (<ProgressBar animated now={100} label="Загрузка.." />)
    }

    return (
        <Form>
            <Form.Group className="mb-4" controlId="pool1">
                <InputGroup>
                    <InputGroup.Text>Pool 1</InputGroup.Text>
                    <Form.Control
                        type="text"
                        name="pool1url"
                        placeholder="Url"
                        value={editData.pool1url}
                        onChange={handleChange}
                    />
                    <Form.Control
                        type="text"
                        name="pool1user"
                        placeholder="Worker"
                        value={editData.pool1user}
                        onChange={handleChange}
                    />
                    <Form.Control
                        type="password"
                        name="pool1pw"
                        placeholder="Password"
                        value={editData.pool1pw}
                        onChange={handleChange}
                    />
                </InputGroup>
            </Form.Group>
            <Form.Group className="mb-4" controlId="pool2">
                <InputGroup>
                    <InputGroup.Text>Pool 2</InputGroup.Text>
                    <Form.Control
                        type="text"
                        name="pool2url"
                        placeholder="Url"
                        value={editData.pool2url}
                        onChange={handleChange}
                    />
                    <Form.Control
                        type="text"
                        name="pool2user"
                        placeholder="Worker"
                        value={editData.pool2user}
                        onChange={handleChange}
                    />
                    <Form.Control
                        type="password"
                        name="pool2pw"
                        placeholder="Password"
                        value={editData.pool2pw}
                        onChange={handleChange}
                    />
                </InputGroup>
            </Form.Group>
            <Form.Group className="mb-4" controlId="pool3">
                <InputGroup>
                    <InputGroup.Text>Pool 3</InputGroup.Text>
                    <Form.Control
                        type="text"
                        name="pool3url"
                        placeholder="Url"
                        value={editData.pool3url}
                        onChange={handleChange}
                    />
                    <Form.Control
                        type="text"
                        name="pool3user"
                        placeholder="Worker"
                        value={editData.pool3user}
                        onChange={handleChange}
                    />
                    <Form.Control
                        type="password"
                        name="pool3pw"
                        placeholder="Password"
                        value={editData.pool3pw}
                        onChange={handleChange}
                    />
                </InputGroup>
            </Form.Group>
            <Form.Group className="mb-4">
                <InputGroup>
                    <InputGroup.Text>Advanced</InputGroup.Text>
                    <Form.Select
                        name="protocol"
                        value={editData.protocol}
                        onChange={handleChange}
                    >
                        <option>Pool Protocol</option>
                        <option value="getwork">Getwork</option>
                        <option value="stratum V1.0">Stratum V1.0</option>
                    </Form.Select>
                    <Form.Select
                        name="coin"
                        value={editData.coin}
                        onChange={handleChange}
                    >
                        <option>Coin Select</option>
                        <option value="eth">ETH</option>
                        <option value="etc">ETC</option>
                        <option value="etc_zil">ETC+ZIL</option>
                    </Form.Select>
                    <Form.Select
                        name="work_pattern"
                        value={editData.work_pattern}
                        onChange={handleChange}
                    >
                        <option>Work Mode</option>
                        <option value="1">Efficiency</option>
                        <option value="2">Balance</option>
                        <option value="3">Performance</option>
                        <option value="4">Performance Ultra</option>
                    </Form.Select>
                </InputGroup>
            </Form.Group>
            <div>
                <Button variant="primary" className="me-3" onClick={handleSave} disabled={saving}>
                    Сохранить
                </Button>
                <Button variant="primary" className="me-3" onClick={handleSaveAndResetState} disabled={saving}>
                    Сохранить и перезагрузить
                </Button>
                <Button variant="secondary" className="me-3" onClick={handleClose} disabled={saving}>
                    Закрыть
                </Button>
            </div>
            {saving && (<ProgressBar animated now={100} label="Сохранение.." className="mt-4 mb-2" />)}
        </Form>
    )
}