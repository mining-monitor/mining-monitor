export const auth = {
    getAuthorization: () => getAuthorization(),

    isAccountCreated: async () => await send("has", {}),

    isAuth: async () => await send("check", getAuthorization()),

    createAccount: async (login: string, password: string) => {
        if (!isValidCredentials(login, password)) {
            return false
        }

        const data = { login, password }
        const [result, token] = await sendToken("register", { Register: JSON.stringify(data) })
        if (!result) {
            return false
        }

        setToken(token)
        return true
    },

    login: async (login: string, password: string) => {
        if (!isValidCredentials(login, password)) {
            return false
        }

        const data = { login, password }
        const [result, token] = await sendToken("login", { Login: JSON.stringify(data) })
        if (!result) {
            return false
        }

        setToken(token)
        return true
    },

    deleteAccount: async () => {
        return await send("remove", getAuthorization())
    },
}

const send = async (url: string, headers: any) => {
    const result = await fetch(`/auth/${url}`, {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/json;charset=utf-8"
        },
    })

    return result.ok
}

const sendToken = async (url: string, headers: any): Promise<[boolean, string]> => {
    const result = await fetch(`/auth/${url}`, {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/json;charset=utf-8"
        },
    })

    return [result.ok, result.headers.get("auth-token")]
}

const tokenKey = "mining-monitor-token"

const getToken = () => localStorage.getItem(tokenKey)

const setToken = (token: string) => localStorage.setItem(tokenKey, token)

const isValidCredentials = (login: string, password: string) => login.length >= 4 && password.length >= 8

const getAuthorization = () => ({ Authorization: `Bearer ${getToken() || ""}` })
