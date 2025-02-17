import * as React from "react"
import { SettingsProps } from "../../lib/settings"
import { Form, InputGroup, Accordion } from "react-bootstrap"
import { telegram } from "../../../../lib/telegram"

interface Props extends SettingsProps {
    index: string,
}

export const EdtiSettings = (props: Props) => {
    const [error, setError] = React.useState<string | null>(null)

    const handleChangeNotifications = (x: any) => {
        const telegramBotChatId = x.target.name === "telegramBotUsername"
            ? ""
            : props.settings.notifications.telegramBotChatId

        props.onChangeSettings({
            ...props.settings,
            notifications: { ...props.settings.notifications, [x.target.name]: x.target.value, telegramBotChatId }
        })
    }

    const handleToogleNotifications = async (x: any) => {
        setError(null)

        if (!x.target.checked) {
            props.onChangeSettings({
                ...props.settings,
                notifications: { ...props.settings.notifications, enabled: false }
            })

            return
        }


        if (!props.settings.notifications.telegramBotToken
            || !props.settings.notifications.telegramBotUsername) {
            setError("Укажите токен бота и имя пользователя")

            return
        }

        if (props.settings.notifications.telegramBotChatId) {
            props.onChangeSettings({
                ...props.settings,
                notifications: { ...props.settings.notifications, enabled: true }
            })

            return
        }

        const telegramBotChatId = await telegram.getChatId(
            props.settings.notifications.telegramBotUsername,
            props.settings.notifications.telegramBotToken
        )
        if (!telegramBotChatId) {
            setError(`Не удалось найти чат с пользователем ${props.settings.notifications.telegramBotUsername}.`
                + " Попробуйте отправить сообщение боту и повторно включить уведомления")

            return
        }

        props.onChangeSettings({
            ...props.settings,
            notifications: { ...props.settings.notifications, enabled: true, telegramBotChatId }
        })
    }

    const handleChangeProxy = (x: any) => {
        let proxy = x.target.value as string
        
        if (proxy.startsWith("http://")) proxy = proxy.substring("http://".length)
        if (proxy.startsWith("https://")) proxy = proxy.substring("https://".length)
        if (proxy.endsWith("/")) proxy = proxy.substring(0, proxy.length - 1)

        props.onChangeSettings({
            ...props.settings,
            proxy,
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
                            <InputGroup.Checkbox
                                name="enabled"
                                checked={props.settings.notifications.enabled || false}
                                onChange={handleToogleNotifications} />
                            <Form.Control
                                type="text"
                                name="telegramBotToken"
                                placeholder="Telegram Bot Token"
                                value={props.settings.notifications.telegramBotToken}
                                disabled={props.settings.notifications.enabled}
                                onChange={handleChangeNotifications}
                            />
                            <Form.Control
                                type="text"
                                name="telegramBotUsername"
                                placeholder="Telegram Bot Username"
                                value={props.settings.notifications.telegramBotUsername}
                                disabled={props.settings.notifications.enabled}
                                onChange={handleChangeNotifications}
                            />
                        </InputGroup>
                        {!!error && (<div className="text-danger">{error}</div>)}
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="login-and-password">
                        <InputGroup className="mb-3">
                            <InputGroup.Text>Прокси-сервер</InputGroup.Text>
                            <Form.Control
                                type="text"
                                name="proxy"
                                placeholder="Домен вида example-domain.com"
                                value={props.settings.proxy}
                                onChange={handleChangeProxy}
                            />
                        </InputGroup>
                    </Form.Group>
                </Form>
            </Accordion.Body>
        </Accordion.Item>
    )
}