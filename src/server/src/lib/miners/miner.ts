export interface Miner {
    name: string,
    send: (request: any) => Promise<[string | null, number]>,
}