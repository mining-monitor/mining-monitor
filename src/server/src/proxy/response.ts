import * as fs from "fs"

export class WebSocketResponse {
    private file: Buffer | null = null
    private response: object | string | null = null
    private code: number | null = null

    public sendFile(fileName: string) {
        fileName = fileName.replace("/src/controllers/", "/")
        this.file = fs.readFileSync(fileName)
    }

    public get(): any {
        if (this.file) {
            return this.file
        }
    }
}