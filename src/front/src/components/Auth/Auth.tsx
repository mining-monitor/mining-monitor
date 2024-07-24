import * as React from "react"
import { Container, Row, Col, Form, Button } from "react-bootstrap"
import { auth } from "../../lib/auth"
import { Credentials } from "../../lib/settings"
import { path } from "../../lib/path"

interface Props {
    onAuth: (isAuth: boolean) => void,
}

export const Auth = (props: Props) => {
    const [step, setStep] = React.useState<"None" | "NoAccount" | "NotLogin">("None")
    const [credentials, setCredentials] = React.useState<Credentials>({ login: "", password: "" })
    const [loginState, setLoginState] = React.useState<"None" | "InvalidCredentials">("None")

    React.useEffect(() => { checkLogin() }, [])

    const checkLogin = async () => {
        const hasAccount = await auth.isAccountCreated()

        if (!hasAccount) {
            setStep("NoAccount")
            return
        }

        const hasAuth = await auth.isAuth()
        if (hasAuth) {
            props.onAuth(true)
            return
        }

        setStep("NotLogin")
    }

    const handleChange = (x: any) => {
        setCredentials({
            ...credentials,
            [x.target.name]: x.target.value,
        })
    }

    const handleCreateAccount = async () => {
        const isAuth = await auth.createAccount(credentials.login, credentials.password)
        if (!isAuth) {
            setLoginState("InvalidCredentials")
            return
        }

        props.onAuth(true)
    }

    const handleLogin = async () => {
        const isAuth = await auth.login(credentials.login, credentials.password)
        if (!isAuth) {
            setLoginState("InvalidCredentials")
            return
        }

        props.onAuth(true)
    }

    const handleDeleteAccount = async () => {
        const isDelete = await auth.deleteAccount()

        if (isDelete) {
            setStep("NoAccount")
        }
    }

    if (step === "None") {
        return null
    }

    if (step === "NoAccount") {
        return (
            <Master>
                <h1 className="my-3">Регистрация</h1>
                <Form>
                    <Form.Group className="mb-3" controlId="login">
                        <Form.Control
                            type="text"
                            name="login"
                            placeholder="Логин"
                            value={credentials.login}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="password">
                        <Form.Control
                            type="password"
                            name="password"
                            placeholder="Пароль"
                            value={credentials.password}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    {loginState === "InvalidCredentials" && (
                        <div className="my-3 text-danger">
                            Логин должен содержать минимум 4 символа <br />
                            Пароль должен содержать минимум 8 символов
                        </div>
                    )}

                    <div className="d-grid gap-2">
                        <Button variant="primary" onClick={handleCreateAccount}>
                            Зарегистрироваться
                        </Button>
                    </div>
                </Form>
            </Master>
        )
    }

    return (
        <Master>
            <h1 className="my-3">Авторизация</h1>
            <Form>
                <Form.Group className="mb-3" controlId="login">
                    <Form.Control
                        type="text"
                        name="login"
                        placeholder="Логин"
                        value={credentials.login}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                    <Form.Control
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={credentials.password}
                        onChange={handleChange}
                    />
                </Form.Group>

                {loginState === "InvalidCredentials" && (
                    <div className="my-3 text-danger">
                        Логин или пароль указаны не верно
                    </div>
                )}

                <div className="d-grid gap-2">
                    <Button variant="primary" onClick={handleLogin}>
                        Войти
                    </Button>
                    <Button variant="secondary" onClick={handleDeleteAccount} title="Все данные удалятся">
                        Сбросить пароль
                    </Button>
                </div>
            </Form>
        </Master>
    )
}

const Master = (props: React.PropsWithChildren) => {
    return (
        <Container className="my-3">
            <Row className="justify-content-md-center">
                <Col md="auto" style={({ width: 300 })}>
                    {props.children}
                </Col>
            </Row>
        </Container>
    )
}