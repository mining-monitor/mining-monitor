import { spawn } from "child_process"
import * as fs from "fs"
import fetch from "electron-fetch"
import { environment } from "./environment"
import { log } from "./log"

export const webServerRunner = {
    run: async (onSuccess: () => void) => {
        environment.createDirectory("")
        environment.createDirectory("dist")

        log.info("Start load files")

        await Promise.all([
            loadFile("https://mining-monitor.github.io/mining-monitor/js/server.js", "server.js"),
            loadFile("https://mining-monitor.github.io/mining-monitor/js/dist/favicon.ico", "dist", "favicon.ico"),
            loadFile("https://mining-monitor.github.io/mining-monitor/js/dist/index.html", "dist", "index.html"),
            loadFile("https://mining-monitor.github.io/mining-monitor/js/dist/main.js", "dist", "main.js"),
            loadFile("https://mining-monitor.github.io/mining-monitor/js/dist/update.js", "dist", "update.js")
        ])

        log.info("Start application")
        commandLine("supervisor", environment.getPath("server.js"))

        log.info("Application is running")
        setTimeout(onSuccess, 3000)
    },
}

const loadFile = async (url: string, ...paths: string[]) => {
    const filePath = environment.getPath(...paths)
    const result = await (await fetch(url)).buffer()
    fs.writeFileSync(filePath, result)
}

const commandLine = (message: string, ...args: string[]) => spawn(message, args, { cwd: environment.getPath(""), shell: true })