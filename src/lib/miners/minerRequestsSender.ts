export interface MinerRequestsSender {
    send: (body: object, timeout?: number) => Promise<[boolean, string]>,
}