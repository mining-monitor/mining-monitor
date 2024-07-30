import * as path from "path"
import * as os from "os"
import * as fs from "fs"

export const environment = {
    getPath: (...paths: string[]) => path.join(os.homedir(), ".mining-monitor", ...paths),
    createDirectory: (...paths: string[]) => {
        const directoryPath = environment.getPath(...paths)
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath)
        }
    },
}