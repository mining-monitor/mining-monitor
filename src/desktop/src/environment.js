const path = require("path")
const os = require("os")
const fs = require("fs")
const { spawn } = require("child_process")

const environment = {
    getPath: (...paths) => path.join(os.homedir(), ".mining-monitor", ...paths),
    createDirectory: (...paths) => {
        const directoryPath = environment.getPath(...paths)
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath)
        }
    },
    commandLine: (message, ...args) => spawn(
        message,
        args,
        { cwd: environment.getPath(""), shell: true }
    ),
}

module.exports.environment = environment