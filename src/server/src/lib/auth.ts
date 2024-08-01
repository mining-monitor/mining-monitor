import * as bcrypt from "bcrypt-ts"
import * as jwt from "jsonwebtoken"
import { Request, Response } from "express"
import { dataBase } from "./dataBase"
import { log } from "./log"

interface Account {
    login: string,
    password: string,
}

let secretCache: string | null = null
let loginCache: string | null = null

const accountKey = "account"
const secretKey = "secret-key"

export const authController = {
    has: async (_: Request, response: Response) => {
        const hasAuth = await hasAuthorization()
        log.debug("authController", "hasAuthorization", hasAuth)

        if (!hasAuth) {
            accessDenied(response)
            return
        }

        successAccess(response)
    },
    check: async (request: Request, response: Response) => {
        const isAuth = await checkAuthorization(request.headers.authorization, "/data")
        log.debug("authController", "checkAuthorization", isAuth)

        if (!isAuth) {
            accessDenied(response)
            return
        }

        successAccess(response)
    },
    login: async (request: Request, response: Response) => {
        const [isLogin, token] = await login(request.headers.login as string)
        log.debug("authController", "login", isLogin)

        if (!isLogin) {
            accessDenied(response)
            return
        }

        successLogin(response, token!)
    },
    register: async (request: Request, response: Response) => {
        const [isRegister, token] = await register(request.headers.register as string)
        log.debug("authController", "register", isRegister)

        if (!isRegister) {
            accessDenied(response)
            return
        }

        successLogin(response, token!)
    },
    remove: async (_: Request, response: Response) => {
        const isRemove = await remove()
        log.debug("authController", "remove", isRemove)

        if (!isRemove) {
            accessDenied(response)
            return
        }

        successAccess(response)
    },
}

export const authMiddleware = async (request: Request, response: Response, next: () => void) => {
    log.debug("authMiddleware", request.url)

    const isAuth = await checkAuthorization(request.headers.authorization, request.path)
    log.debug("authMiddleware", "checkAuthorization", isAuth)

    if (!isAuth) {
        accessDenied(response)
        return
    }

    next()
}

const accessDenied = (response: Response) => {
    response
        .status(401)
        .send("Access Denied / Unauthorized request")
}

const successAccess = (response: Response) => {
    response
        .status(200)
        .send("Success Access")
}

const successLogin = (response: Response, token: string) => {
    response
        .header("auth-token", token)
        .status(200)
        .send("Success Access")
}

const hasAuthorization = async () => {
    if (!loginCache) {
        const account = await getAccount()
        if (account) {
            loginCache = account.login
        }
    }

    return !!loginCache
}

const checkAuthorization = async (authorization?: string, url?: string) => {
    if (isNotAuthUrl(url!)) {
        return true
    }

    if (!authorization) {
        return false
    }

    const [_, token] = authorization.split(" ")
    if (!token) {
        return false
    }

    try {
        jwt.verify(token, await getOrGenerateSecret())

        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

const notAuthUrls = [
    "/",
    "/favicon.ico",
    "/main.js",
    "/update.js",
    "/health/check",
]
const isNotAuthUrl = (url: string) => {
    if (!url) {
        throw new Error("Url is empty")
    }

    if (url.startsWith("/auth/")) {
        return true
    }

    if (notAuthUrls.includes(url)) {
        return true
    }

    return false
}

const login = async (data: string): Promise<[boolean, string | null]> => {
    if (!data) {
        return [false, null]
    }

    const hasAuth = await hasAuthorization()
    if (!hasAuth) {
        return [false, null]
    }

    const object = JSON.parse(data)
    const account = await getAccount()

    const validPass = await bcrypt.compare(object.password, account!.password);
    if (!validPass) {
        return [false, null]
    }

    const token = jwt.sign({ user: object.login }, await getOrGenerateSecret())
    return [true, token]
}

const register = async (data: string): Promise<[boolean, string | null]> => {
    if (!data) {
        return [false, null]
    }

    const hasAuth = await hasAuthorization()
    if (hasAuth) {
        return [false, null]
    }

    const object = JSON.parse(data)

    await saveAccount({
        login: object.login,
        password: await bcrypt.hash(object.password, await bcrypt.genSalt(10))
    })

    loginCache = object.login

    const token = jwt.sign({ user: object.login }, await getOrGenerateSecret())
    return [true, token]
}

const remove = async () => {
    await removeAccount()

    secretCache = null
    loginCache = null

    return true
}

const getOrGenerateSecret = async () => {
    if (!secretCache) {
        if (await dataBase.key(secretKey)) {
            secretCache = await dataBase.get(secretKey)
        }
    }

    if (!secretCache) {
        secretCache = await bcrypt.genSalt(10)
        await dataBase.set(secretKey, secretCache)
    }

    return secretCache
}

const getAccount = async (): Promise<Account | null> => {
    if (!(await dataBase.key(accountKey))) {
        return null
    }

    return await dataBase.get(accountKey)
}

const saveAccount = async (account: Account) => {
    await dataBase.set(accountKey, account)
}

const removeAccount = async () => {
    await dataBase.clear()
}

export const auth = {
    checkAuthorization,
    accessDenied,
}