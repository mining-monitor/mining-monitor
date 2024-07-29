export const log = {
    debug: (message?: any, ...optionalParams: any[]) => process.env.debug && console.log(message, ...optionalParams),
    info: (message?: any, ...optionalParams: any[]) => console.log(message, ...optionalParams),
    error: (message?: any, ...optionalParams: any[]) => console.error(message, ...optionalParams),
}