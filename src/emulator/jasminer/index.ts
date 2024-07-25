import express from "express"
import { controller } from "./controller"

const app = express()

app.use(express.urlencoded())

app.get("/cgi-bin/minerStatus_all.cgi", controller.status)
app.get("/cgi-bin/reboot.cgi", controller.reboot)
app.get("/cgi-bin/get_pools.cgi", controller.getPools)
app.post("/cgi-bin/set_pools.cgi", controller.setPools)

app.listen(4010)

