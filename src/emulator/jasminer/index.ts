import express from "express"
import { controller } from "./controller"

const app = express()

app.get("/cgi-bin/minerStatus_all.cgi", controller.getPools)

app.listen(4010)

