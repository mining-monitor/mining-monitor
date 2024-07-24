export interface MinerRequestsSender {
    send: (body: object, timeout?: number) => Promise<[boolean, string]>,
}

let current: MinerRequestsSender | null = null

export const minerRequestsSender = {
    init: (minerRequestsSender: MinerRequestsSender) => current = minerRequestsSender,
    current: () => current,
}