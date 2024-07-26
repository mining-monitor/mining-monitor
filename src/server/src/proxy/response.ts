import * as fs from "fs"

export class WebSocketResponse {
    private headers: any = {}
    private code: number = 200
    private response: Buffer | object | string = ""

    public sendFile(fileName: string) {
        fileName = fileName.replace("/src/controllers/", "/")
        this.response = fs.readFileSync(fileName)
        
        return this
    }

    public status(code: number) {
        this.code = code
        
        return this
    }

    public sendStatus(code: number) {
        this.code = code
        
        return this
    }

    public send(response: object | string) {
        this.response = response
        
        return this
    }

    public header(name: string, value: string) {
        this.headers[name] = value
        
        return this
    }

    public get(): any {
        return {
            headers: this.headers,
            code: this.code,
            response: this.response,
        }
    }
}