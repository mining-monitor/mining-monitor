import { MinerSettings } from "../../../../lib/settings"
import { Miner, miners } from "./miners";

interface Search {
    login: string,
    password: string,
    ipStart: string,
    ipEnd: string,
    miner: string,
}

export const minersSearcher = {
    search: async (search: Search, skip: string[]): Promise<MinerSettings[]> => {
        const miner = miners.get(search.miner)
        const newMiners: MinerSettings[] = []

        for (const ip of getIps(search.ipStart, search.ipEnd, skip)) {
            const minerInfo = await getMinerInfo(miner, ip, search)
            if (!minerInfo) {
                continue
            }

            newMiners.push({
                ip: minerInfo.ip,
                name: minerInfo.name,
                miner: minerInfo.miner,
                credentials: {
                    login: search.login,
                    password: search.password,
                }
            })
        }

        return newMiners
    },
}

const getMinerInfo = async (miner: Miner, ip: string, search: Search) => {
    try {
        return await miner.getInfo(ip, search.login, search.password)
    } catch (error) {
        console.error(error)
    }
}

const getIps = (ipStart: string, ipEnd: string, skip: string[]) => {
    if (!ipStart) {
        return []
    }

    if (!ipEnd) {
        return [ipStart]
    }

    const firstPart = ipStart.substring(0, ipStart.lastIndexOf("."))
    const startSecondPart = parseInt(ipStart.substring(ipStart.lastIndexOf(".") + 1))
    const endSecondPart = parseInt(ipEnd.substring(ipStart.lastIndexOf(".") + 1))

    const ips: string[] = []

    for (let i = startSecondPart; i <= endSecondPart; i++) {
        const ip = `${firstPart}.${i}`
        if (skip.indexOf(ip) !== -1) {
            continue
        }

        ips.push(ip)
    }

    return ips
}