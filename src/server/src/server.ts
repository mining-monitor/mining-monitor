import express from "express"
import { staticController } from "./controllers/staticController"
import { requestsController } from "./controllers/requestsController"
import { dataController } from "./controllers/dataController"
import { minersController } from "./controllers/minersController"
import { healthController } from "./controllers/healthController"
import { minerInfosUpdaterScheduler } from "./schedulers/minerInfosUpdaterScheduler"
import { notificationsScheduler } from "./schedulers/notificationsScheduler"
import { authController, authMiddleware } from "./lib/auth"
import { proxy } from "./proxy/proxy"
import { serverConfig } from "./config/serverConfig"
import { log } from "./lib/log"
import dotenv from "dotenv"
import { eventsScheduler } from "./schedulers/eventsScheduler"
import { environment } from "./lib/environment"

dotenv.config()

setInterval(minerInfosUpdaterScheduler.work, 1000)
setInterval(notificationsScheduler.work, 10000)
setInterval(eventsScheduler.work, 1000)

const app = express()
proxy.connect()
serverConfig.init(app, proxy)

environment.isDebug() && app.use(express.static("./dist"))
app.use(express.json())
app.use(authMiddleware)

serverConfig.get("/health/check", healthController.check)

serverConfig.get("/", staticController.index)
serverConfig.get("/main.js", staticController.mainJs)
serverConfig.get("/update.js", staticController.updateJs)
serverConfig.get("/favicon.ico", staticController.favicon)

serverConfig.post("/requests/send", requestsController.send)

serverConfig.get("/data", dataController.get)
serverConfig.post("/data", dataController.post)

serverConfig.get("/miners/info", minersController.getInfo)

serverConfig.get("/auth/has", authController.has)
serverConfig.get("/auth/check", authController.check)
serverConfig.post("/auth/login", authController.login)
serverConfig.post("/auth/register", authController.register)
serverConfig.post("/auth/remove", authController.remove)

app.listen(4000)
log.info("server", "Web server started successfully")
