export interface Miner {
    name: string,
    getInfo: (ip: string, login: string, password: string) => Promise<MinerInfo | null>,
    reboot: (ip: string, login: string, password: string) => Promise<boolean>,
}

export interface MinerInfo {
    ip: string,
    name: string,
    miner: string,
    sn: string,
    avgHash: string,
    currentHash: string,
    dagTime: number,
    uptime: string,
    fanPercent: string,
    temp: string,
    poolMiner: string,
    pools: MinerInfoPool[],
}

export interface MinerInfoPool {
    url: string,
    user: string,
    status: string,
}