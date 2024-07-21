import * as React from "react"
import { SettingsProps } from "../../libs/settings"
import { Form, InputGroup, Accordion } from "react-bootstrap"

interface Props extends SettingsProps {
    index: string,
}

export const EdtiSettings = (props: Props) => {
    const handleChangeNotifications = (x: any) => {
        props.onChangeSettings({
            ...props.settings,
            notifications: { ...props.settings.notifications, [x.target.name]: x.target.value }
        })
    }

    return (
        <Accordion.Item eventKey={props.index}>
            <Accordion.Header><h5 className="mb-0">Настройки</h5></Accordion.Header>
            <Accordion.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="login-and-password">
                        <InputGroup className="mb-3">
                            <InputGroup.Text>Уведомления</InputGroup.Text>
                            <Form.Control
                                type="text"
                                name="telegramBotToken"
                                placeholder="Telegram Bot Token"
                                value={props.settings.notifications.telegramBotToken}
                                onChange={handleChangeNotifications}
                            />
                        </InputGroup>
                    </Form.Group>
                </Form>
            </Accordion.Body>
        </Accordion.Item>
    )
}