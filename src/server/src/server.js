const express = require("express")
const { digestAuthRequestAsync } = require("./digestAuthRequest")
const { authMiddleware } = require("./auth")
const { dataBase } = require("./dataBase")

const app = express()

app.use(express.static("./dist"))
app.use(express.json({ extended: false }))
app.use(authMiddleware)

// *** Static ***

app.get("/", function (_, response) {
    response.sendFile(__dirname + "/dist/index.html")
})

app.get("/main.js", function (_, response) {
    response.sendFile(__dirname + "/dist/main.js")
})

app.get("/update.js", function (_, response) {
    response.sendFile(__dirname + "/dist/update.js")
})

app.get("/favicon.ico", function (_, response) {
    response.sendFile(__dirname + "/dist/favicon.ico")
})

// *** Requests ***

app.post("/requests/get", async function (request, response) {
    console.log(request.body)

    if (!request.body || !request.body.url) {
        return response.sendStatus(400)
    }

    const [result, resultCode] = await digestAuthRequestAsync({
        method: "GET",
        url: request.body.url,
        username: request.body.login,
        password: request.body.password,
    })

    if (resultCode !== 200) {
        return response.sendStatus(resultCode)
    }

    response.send(result)
})

app.post("/requests/post/form", async function (request, response) {
    console.log(request.body)

    if (!request.body || !request.body.url || !request.body.data) {
        return response.sendStatus(400)
    }

    const [result, resultCode] = await digestAuthRequestAsync({
        method: "POST",
        url: request.body.url,
        username: request.body.login,
        password: request.body.password,
        data: request.body.data,
        contentType: "application/x-www-form-urlencoded",
        retryCount: 1,
        timeout: 5000,
    })

    if (resultCode !== 200) {
        return response.sendStatus(resultCode)
    }

    response.send(result)
})

// *** Data ***

app.post("/data", async function (request, response) {
    console.log(request.body)
    console.log(request.query)

    if (!request.body || !request.query.key) {
        return response.sendStatus(400)
    }

    dataBase.set(request.query.key, request.body)

    response.send("ok")
})

app.get("/data", async function (request, response) {
    console.log(request.query)

    if (!request.query.key) {
        return response.sendStatus(400)
    }

    const data = dataBase.get(request.query.key)
    if (!data) {
        return response.sendStatus(404)
    }

    response.send(data)
})

// *** Start ***

app.listen(4000)