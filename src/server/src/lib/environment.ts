import fs from "fs"
import path from "path"

export const environment = {
    isDebug: () => !!process.env.debug,
    getPath: (...paths: string[]) => path.join(...paths),
    createDirectory: (...paths: string[]) => {
        const directoryPath = environment.getPath(...paths)
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath)
        }
    },
}