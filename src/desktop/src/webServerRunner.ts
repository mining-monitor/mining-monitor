import { spawn } from "child_process"
import * as os from "os"
import * as fs from "fs"
import * as path from "path"
import fetch from "electron-fetch"

export const webServerRunner = {
    run: async (onSuccess: () => void) => {
        createDirectory("")
        createDirectory("dist")

        console.log("Start load files")

        await Promise.all([
            loadFile("https://mining-monitor.github.io/mining-monitor/js/server.js", "server.js"),
            loadFile("https://mining-monitor.github.io/mining-monitor/js/dist/favicon.ico", "dist", "favicon.ico"),
            loadFile("https://mining-monitor.github.io/mining-monitor/js/dist/index.html", "dist", "index.html"),
            loadFile("https://mining-monitor.github.io/mining-monitor/js/dist/main.js", "dist", "main.js"),
            loadFile("https://mining-monitor.github.io/mining-monitor/js/dist/update.js", "dist", "update.js")
        ])

        console.log("Start application")
        commandLine("supervisor", getPath("server.js"))

        console.log("Application is running")
        setTimeout(onSuccess, 3000)
    },
}

const createDirectory = (...paths: string[]) => {
    const directoryPath = getPath(...paths)
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath)
    }
}

const loadFile = async (url: string, ...paths: string[]) => {
    const filePath = getPath(...paths)
    const result = await (await fetch(url)).buffer()
    fs.writeFileSync(filePath, result)
}

const commandLine = (message: string, ...args: string[]) => spawn(message, args, { cwd: getPath(""), shell: true })

const getPath = (...paths: string[]) => path.join(os.homedir(), ".mining-monitor", ...paths)