import * as path from "path"
import * as os from "os"

export const environment = {
    getPath: (...paths: string[]) => path.join(os.homedir(), ".mining-monitor", ...paths)

}