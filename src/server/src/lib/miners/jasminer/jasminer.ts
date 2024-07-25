import { digestAuthRequestAsync } from "./digestAuthRequest"
import { Miner } from "../miner"
import { jasminer as jasminerBase } from "../../../../../lib/miners/jasminer"
import { minerRequestsSender } from "../minersRequestsSender"

jasminerBase.setSender(minerRequestsSender)

export const jasminer: Miner = {
    ...jasminerBase,
    send: async (request: any): Promise<[object | null, number]> => {
        switch (request.action || "") {
            case "get":
                return await get(request)

            case "postForm":
                return await postForm(request)

            default:
                return [null, 400]
        }
    },
}

const get = async (request: any): Promise<[object | null, number]> => {
    if (!request.url) {
        return [null, 400]
    }

    return await digestAuthRequestAsync({
        method: "GET",
        url: request.url,
        username: request.login,
        password: request.password,
    })
}

const postForm = async (request: any): Promise<[object | null, number]> => {
    if (!request.url || !request.data) {
        return [null, 400]
    }

    return await digestAuthRequestAsync({
        method: "POST",
        url: request.url,
        username: request.login,
        password: request.password,
        data: request.data,
        contentType: "application/x-www-form-urlencoded",
        retryCount: 1,
        timeout: 5000,
    })
}