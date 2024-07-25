import { Request, Response } from "express"

export const controller = {
    getPools: (_: Request, response: Response) => {
        response.send({
            ...minerInfo,
            summary: {
                ...minerInfo.summary,
                rt: `19${random(99)}.15 MH/s`,
            }
        })
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

const random = (max: number) => Math.floor(Math.random() * max)
