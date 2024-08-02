import { environment } from "./environment";

export const log = {
    debug: (message?: any, ...optionalParams: any[]) => environment.isDebug() && console.log(message, ...optionalParams),
    info: (message?: any, ...optionalParams: any[]) => console.log(message, ...optionalParams),
    error: (message?: any, ...optionalParams: any[]) => console.error(message, ...optionalParams),
}