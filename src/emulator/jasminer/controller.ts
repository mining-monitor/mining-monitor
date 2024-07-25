import { Request, Response } from "express"

export const controller = {
    status: async (_: Request, response: Response) => {
        await sleep(random(500))

        response.send({
            ...minerInfo,
            summary: {
                ...minerInfo.summary,
                rt: `19${random(99)}.15 MH/s`,
            }
        })
    },
    reboot: async (_: Request, response: Response) => {
        await sleep(random(1000))

        response.send("Ok")
    },
    getPools: async (_: Request, response: Response) => {
        await sleep(random(500))

        response.send(pools)
    },
    setPools: async (request: Request, response: Response) => {
        await sleep(random(2000))

        pools.pools[0].url = request.body.pool1url
        pools.pools[0].user = request.body.pool1user
        pools.pools[0].pass = request.body.pool1pw

        pools.pools[1].url = request.body.pool2url
        pools.pools[1].user = request.body.pool2user
        pools.pools[1].pass = request.body.pool2pw

        pools.pools[2].url = request.body.pool3url
        pools.pools[2].user = request.body.pool3user
        pools.pools[2].pass = request.body.pool3pw

        pools.protocol = request.body.protocol
        pools.coin = request.body.coin
        pools.work_pattern = request.body.work_pattern

        response.send("Ok")
    },
}

const minerInfo = {
    summary: {
        miner: "Jasminer X16-Q 1950",
        machine_sn: "1234567890",
        avg: "1957.71 MH/s",
        rt: `1971.15 MH/s`,
        dag_time: 100,
        temp_min: "49",
        temp_max: "53",
    },
    boards: {
        fan_percent1: "71",
        fan_percent2: "69",
        fan_percent3: "81",
    },
    pools: {
        pool: [
            {
                url: "http://someUrl_1",
                user: "someUser.jas1",
                status: "InActive",
            },
            {
                url: "http://someUrl_2",
                user: "someUser.jas2",
                status: "NotActive",
            },
            {
                url: "http://someUrl_3",
                user: "someUser.jas1",
                status: "NotActive",
            },
        ]
    }
}

const pools = {
    protocol: "getwork",
    coin: "etc_zil",
    work_pattern: "2",
    pools: [
        {
            url: "http://someUrl_1",
            user: "someUser.jas1",
            pass: "1",
        },
        {
            url: "http://someUrl_2",
            user: "someUser.jas2",
            pass: "1",
        },
        {
            url: "http://someUrl_3",
            user: "someUser.jas1",
            pass: "1",
        },
    ],
}

const random = (max: number) => Math.floor(Math.random() * max)

export const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
