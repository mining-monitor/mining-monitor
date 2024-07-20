const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { dataBase } = require("./dataBase")

let secretCache = null
let loginCache = null

const accountKey = "account"
const secretKey = "secret-key"

exports.authMiddleware = async (request, response, next) => {
    console.log("authMiddleware", request.url)

    if (request.url === "/auth/has") {
        const hasAuth = await hasAuthorization()
        console.log("authMiddleware", "hasAuthorization", hasAuth)

        if (!hasAuth) {
            accessDenied(response)
            return
        }

        successAccess(response)
        return
    }

    if (request.url === "/auth/check") {
        const isAuth = await checkAuthorization(request.headers.authorization)
        console.log("authMiddleware", "checkAuthorization", isAuth)

        if (!isAuth) {
            accessDenied(response)
            return
        }

        successAccess(response)
        return
    }

    if (request.url === "/auth/login") {
        const [isLogin, token] = await login(request.headers.login)
        console.log("authMiddleware", "login", isLogin)

        if (!isLogin) {
            accessDenied(response)
            return
        }

        successLogin(response, token)
        return
    }

    if (request.url === "/auth/register") {
        const [isRegister, token] = await register(request.headers.register)
        console.log("authMiddleware", "register", isRegister)

        if (!isRegister) {
            accessDenied(response)
            return
        }

        successLogin(response, token)
        return
    }

    if (request.url === "/auth/remove") {
        const isRemove = await remove()
        console.log("authMiddleware", "remove", isRemove)

        if (!isRemove) {
            accessDenied(response)
            return
        }

        successAccess(response)
        return
    }

    const isAuth = await checkAuthorization(request.headers.authorization)
    console.log("authMiddleware", "checkAuthorization", isAuth)

    if (!isAuth) {
        accessDenied(response)
        return
    }

    next()
}

const accessDenied = (response) => {
    response
        .status(401)
        .send("Access Denied / Unauthorized request")
}

const successAccess = (response) => {
    response
        .status(200)
        .send("Success Access")
}

const successLogin = (response, token) => {
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

const checkAuthorization = async (authorization) => {
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
        console.log(error)
        return false
    }
}

const login = async (data) => {
    if (!data) {
        return [false, null]
    }

    const hasAuth = await hasAuthorization()
    if (!hasAuth) {
        return [false, null]
    }

    const object = JSON.parse(data)
    const account = await getAccount()

    const validPass = await bcrypt.compare(object.password, account.password);
    if (!validPass) {
        return [false, null]
    }

    const token = jwt.sign({ user: object.login }, await getOrGenerateSecret())
    return [true, token]
}

const register = async (data) => {
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

const getAccount = async () => {
    if (!(await dataBase.key(accountKey))) {
        return null
    }

    return await dataBase.get(accountKey)
}

const saveAccount = async (account) => {
    await dataBase.set(accountKey, account)
}

const removeAccount = async () => {
    await dataBase.clear()
}