import express from "express"
import { authController, authMiddleware } from "./lib/auth"
import { staticController } from "./controllers/staticController"
import { requestsController } from "./controllers/requestsController"
import { dataController } from "./controllers/dataController"
import { minerInfosUpdaterScheduler } from "./schedulers/minerInfosUpdaterScheduler"
import { minersController } from "./controllers/minersController"
import { notificationsScheduler } from "./schedulers/notificationsScheduler"
import { proxy } from "./proxy/proxy"
import { serverConfig } from "./config/serverConfig"

setInterval(minerInfosUpdaterScheduler.work, 1000)
setInterval(notificationsScheduler.work, 10000)

const app = express()
proxy.connect()
serverConfig.init(app, proxy)

app.use(express.static("./dist"))
app.use(express.json())
app.use(authMiddleware)

serverConfig.get("/", staticController.index)
serverConfig.get("/main.js", staticController.mainJs)
serverConfig.get("/update.js", staticController.updateJs)
serverConfig.get("/favicon.ico", staticController.favicon)

serverConfig.post("/requests/send", requestsController.send)

serverConfig.get("/data", dataController.get)
serverConfig.post("/data", dataController.post)

serverConfig.get("/miners/info", minersController.getInfo)

serverConfig.post("/auth/has", authController.has)
serverConfig.post("/auth/check", authController.check)
serverConfig.post("/auth/login", authController.login)
serverConfig.post("/auth/register", authController.register)
serverConfig.post("/auth/remove", authController.remove)

app.listen(4000)
console.log("server", "Web server started successfully")
