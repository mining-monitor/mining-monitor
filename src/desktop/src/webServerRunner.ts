import { exec } from "child_process"
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

        commandLine(`supervisor ${getPath("server.js")}`)

        console.log("Application is running")
       
        setTimeout(onSuccess, 5000)
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
    const result = await (await fetch(url)).text()
    fs.writeFileSync(filePath, result)
}

const commandLine = (message: string) => exec(message, { cwd: getPath(""), maxBuffer: 1024 * 1024 * 1024 * 1024 }, execCallback)

const getPath = (...paths: string[]) => path.join(os.homedir(), ".mining-monitor", ...paths)

const execCallback = (error: Error, stdout: string, stderr: string) => {
    const dubug = false

    if (error && dubug) {
        console.log(`error: ${error.message}`)
        return
    }

    if (stderr && dubug) {
        console.log(`stderr: ${stderr}`)
        return
    }

    dubug && console.log(`stdout: ${stdout}`)
}