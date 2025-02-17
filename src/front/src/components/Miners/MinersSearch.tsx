import * as React from "react"
import { SettingsProps } from "../../lib/settings"
import { MinerSettings } from "../../../../lib/settings"
import { Form, Button, InputGroup, Accordion, Row, Col, ProgressBar } from "react-bootstrap"
import { minersSearcher } from "../../lib/miners/minersSearcher"
import { minerNames as getMinerNames } from "../../lib/miners/miners"
import { Message, ToastMessage } from "../Common/ToastMessage"

interface Props extends SettingsProps {
    index: string,
}

interface Search {
    login: string,
    password: string,
    ipStart: string,
    ipEnd: string,
    miner: string,
}

export const MinersSearch = (props: Props) => {
    const [search, setSearch] = React.useState<Search>({ login: "", password: "", ipStart: "", ipEnd: "", miner: "" })
    const [searchState, setSearchState] = React.useState<"None" | "Searching">("None")
    const [searchResultState, setSearchResultState] = React.useState<"None" | "Error">("None")
    const [searchProgress, setSearchProgress] = React.useState(-1)
    const [message, setMessage] = React.useState<Message>({ head: "", text: "" })

    const handleChange = (x: any) => {
        setSearch({
            ...search,
            [x.target.name]: x.target.value,
        })
    }

    const handleProgress = (current: number, total: number) => {
        setSearchProgress(Math.floor(current / total * 100))
    }

    const handleSearch = async () => {
        setSearchState("Searching")
        setSearchResultState("None")

        try {
            const skip = props.settings.miners.map(x => x.ip)
            const miners = await minersSearcher.search(search, skip, handleProgress)

            const newMiners = [...props.settings.miners, ...miners]
            newMiners.sort(compareMiners)

            props.onChangeSettings({ ...props.settings, miners: [...newMiners] })

            sendNotification(miners)
        } catch (error) {
            console.error(error)
            setSearchResultState("Error")
        }

        setSearchState("None")
        setSearchProgress(-1)
    }

    const sendNotification = (miners: MinerSettings[]) => {
        setMessage({
            head: "Поиск майнеров",
            text: miners.length === 0
                ? "Не удалось найти новые майнеры"
                : `Найдены новые майнеры ${miners.map(x => x.ip).join(", ")}`
        })
    }

    return (
        <Accordion.Item eventKey={props.index}>
            <Accordion.Header><h5 className="mb-0">Поиск майнеров</h5></Accordion.Header>
            <Accordion.Body>
                <ToastMessage message={message} />
                <Form>
                    <Form.Group className="mb-3" controlId="login-and-password">
                        <InputGroup className="mb-3">
                            <InputGroup.Text>Авторизация<span className="d-none d-lg-inline"> на майнере</span></InputGroup.Text>
                            <Form.Control
                                type="text"
                                name="login"
                                placeholder="Логин"
                                value={search.login}
                                onChange={handleChange}
                            />
                            <Form.Control
                                type="password"
                                name="password"
                                placeholder="Пароль"
                                value={search.password}
                                onChange={handleChange}
                            />
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="ip">
                        <InputGroup className="mb-3">
                            <InputGroup.Text>
                                <span className="d-inline d-lg-none">IP адреса</span>
                                <span className="d-none d-lg-inline">Сканирование IP адресов</span>
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                name="ipStart"
                                placeholder="Старт"
                                value={search.ipStart}
                                onChange={handleChange}
                            />
                            <Form.Control
                                type="text"
                                name="ipEnd"
                                placeholder="Финиш"
                                value={search.ipEnd}
                                onChange={handleChange}
                            />
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="miner">
                        <InputGroup className="mb-3">
                            <InputGroup.Text>Оборудование<span className="d-none d-lg-inline"> для поиска</span></InputGroup.Text>
                            <Form.Select
                                name="miner"
                                value={search.miner}
                                onChange={handleChange}
                            >
                                <option value="">Выберите майнер</option>
                                {getMinerNames().map(minerName => (
                                    <option value={minerName} key={minerName}>{minerName}</option>
                                ))}
                            </Form.Select>
                        </InputGroup>
                    </Form.Group>

                    {searchResultState === "Error" && (
                        <div className="my-3 text-danger">
                            При поиске майнеров произошла ошибка
                        </div>
                    )}

                    <Row>
                        <Col lg="3">
                            <Button variant="primary" onClick={handleSearch} disabled={searchState === "Searching"} className="px-5">
                                {searchState === "Searching" ? "Поиск..." : "Поиск"}
                            </Button>
                        </Col>
                        <Col lg="9">
                            <div className="my-2 text-end">
                                Нет вашего майнера? Напишите нам в Telegram <a href="https://t.me/FreeMiningMonitor" target="_blank">@FreeMiningMonitor</a> и мы добавим его.
                            </div>
                        </Col>
                    </Row>

                    {searchState === "Searching" && searchProgress >= 0 && (
                        <ProgressBar animated now={searchProgress} label="Поиск.." className="mt-4 mb-2" />
                    )}
                </Form>
            </Accordion.Body>
        </Accordion.Item>
    )
}

const compareMiners = (a: MinerSettings, b: MinerSettings) => {
    if (a.ip > b.ip) {
        return 1;
    }
    if (a.ip < b.ip) {
        return -1;
    }
    return 0;
}