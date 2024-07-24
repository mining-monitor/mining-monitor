import { Miner, MinerInfo } from "./miner"
import { MinerRequestsSender } from "./minerRequestsSender"

export interface EditData {
    pool1url: string,
    pool1user: string,
    pool1pw: string,
    pool2url: string,
    pool2user: string,
    pool2pw: string,
    pool3url: string,
    pool3user: string,
    pool3pw: string,
    coin: string,
    work_pattern: string,
    protocol: string,
}

export interface JasminerMiner extends Miner {
    loadEdit: (ip: string, login: string, password: string) => Promise<EditData | null>,
    edit: (ip: string, login: string, password: string, data: EditData) => Promise<boolean>,
}

let currentSender: MinerRequestsSender | null = null

export const jasminer: JasminerMiner = {
    name: "Jasminer",
    setSender: (sender: MinerRequestsSender) => currentSender = sender,
    getInfo: async (ip: string, login: string, password: string): Promise<MinerInfo | null> => {
        const [isOk, result] = await get(`http://${ip}/cgi-bin/minerStatus_all.cgi`, login, password)
        if (!isOk) {
            return null
        }

        return {
            ip,
            name: "Jasminer",
            miner: result.summary.miner,
            sn: result.summary.machine_sn,
            avgHash: result.summary.avg,
            currentHash: result.summary.rt,
            dagTime: result.summary.dag_time,
            uptime: result.summary.uptime,
            fanPercent: `${result.boards.fan_percent1}% - ${result.boards.fan_percent2}% - ${result.boards.fan_percent3}%`,
            temp: `${result.summary.temp_min}℃ / ${result.summary.temp_max}℃`,
            poolMiner: extractPoolMiner((result.pools.pool as any[])),
            pools: (result.pools.pool as any[]).map(x => ({
                url: x.url,
                user: x.user,
                status: x.status,
            })),
        }
    },
    reboot: async (ip: string, login: string, password: string): Promise<boolean> => {
        const [isOk, _] = await get(`http://${ip}/cgi-bin/reboot.cgi`, login, password, false)
        return isOk
    },
    loadEdit: async (ip: string, login: string, password: string): Promise<EditData | null> => {
        const [isOk, response] = await get(`http://${ip}/cgi-bin/get_pools.cgi`, login, password)
        if (!isOk) {
            return null
        }

        let result = {
            protocol: response.protocol,
            coin: response.coin,
            work_pattern: response.work_pattern,
        }

        const pools = response.pools as any[]
        pools.forEach((pool: any, index: number) => {
            result = {
                ...result,
                [`pool${index + 1}url`]: pool.url,
                [`pool${index + 1}user`]: pool.user,
                [`pool${index + 1}pw`]: pool.pass,
            }
        })

        return result as EditData
    },
    edit: async (ip: string, login: string, password: string, data: EditData): Promise<boolean> => {
        const formData = [
            `pool1url=${encodeURIComponent(data.pool1url)}`,
            `pool1user=${encodeURIComponent(data.pool1user)}`,
            `pool1pw=${encodeURIComponent(data.pool1pw)}`,

            `pool2url=${encodeURIComponent(data.pool2url)}`,
            `pool2user=${encodeURIComponent(data.pool2user)}`,
            `pool2pw=${encodeURIComponent(data.pool2pw)}`,

            `pool3url=${encodeURIComponent(data.pool3url)}`,
            `pool3user=${encodeURIComponent(data.pool3user)}`,
            `pool3pw=${encodeURIComponent(data.pool3pw)}`,

            `coin=${data.coin}`,
            `work_pattern=${data.work_pattern}`,
            `protocol=${data.protocol}`,
        ].join("&")

        console.log(formData)

        const [isOk, _] = await postForm(`http://${ip}/cgi-bin/set_pools.cgi`, login, password, formData)
        return isOk
    },
}

const extractPoolMiner = (pools: any[]) => {
    if (pools.length === 0) {
        return null
    }

    const user = pools.map(x => x.user).find(x => !!x)
    if (!user || user.indexOf(".") === -1) {
        return null
    }

    return user.substring(user.indexOf(".") + 1)
}

const get = async (url: string, login: string, password: string, isJson: boolean = true): Promise<[boolean, any]> => {
    const [ok, result] = await currentSender.send({
        miner: jasminer.name,
        action: "get",
        url,
        login,
        password
    }, 3000)

    if (!ok) {
        return [false, null]
    }

    if (!isJson) {
        return [true, result]
    }

    return [true, JSON.parse(result)]
}

const postForm = async (url: string, login: string, password: string, data: string): Promise<[boolean, string]> => {
    return await currentSender.send({
        miner: jasminer.name,
        action: "postForm",
        url,
        login,
        password,
        data
    }, 5000)
}