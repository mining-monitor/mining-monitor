import { log } from "./log";

export const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const safeExecute = async (action: () => Promise<void>) => {
    try {
        await action()
    } catch(error) {
        log.error(error)
    }
}

export const safeExecuteSync = (action: () => void) => {
    try {
        action()
    } catch(error) {
        log.error(error)
    }
}