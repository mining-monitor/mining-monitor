import express from "express"
import { authMiddleware } from "./lib/auth"
import { staticController } from "./controllers/staticController"
import { requestsController } from "./controllers/requestsController"
import { dataController } from "./controllers/dataController"
import { minerInfosUpdaterScheduler } from "./schedulers/minerInfosUpdaterScheduler"
import { minersController } from "./controllers/minersController"
import { notificationsScheduler } from "./schedulers/notificationsScheduler"

setInterval(minerInfosUpdaterScheduler.work, 1000)
setInterval(notificationsScheduler.work, 10000)

const app = express()

app.use(express.static("./dist"))
app.use(express.json())
app.use(authMiddleware)

app.get("/", staticController.index)
app.get("/main.js", staticController.mainJs)
app.get("/update.js", staticController.updateJs)
app.get("/favicon.ico", staticController.favicon)

app.post("/requests/send", requestsController.send)

app.get("/data", dataController.get)
app.post("/data", dataController.post)

app.get("/miners/info", minersController.getInfo)

app.listen(4000)
console.log("server", "Web server started successfully")