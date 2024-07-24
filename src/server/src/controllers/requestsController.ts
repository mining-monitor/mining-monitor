import { Request, Response } from "express"
import { digestAuthRequestAsync } from "../lib/digestAuthRequest"

export const requestsController = {
    get: async (request: Request, response: Response) => {
        console.log(request.body)

        if (!request.body || !request.body.url) {
            return response.sendStatus(400)
        }

        const [result, resultCode] = await digestAuthRequestAsync({
            method: "GET",
            url: request.body.url,
            username: request.body.login,
            password: request.body.password,
        })

        if (resultCode !== 200) {
            return response.sendStatus(resultCode)
        }

        response.send(result)
    },
    
    postForm: async (request: Request, response: Response) => {
        console.log(request.body)

        if (!request.body || !request.body.url || !request.body.data) {
            return response.sendStatus(400)
        }

        const [result, resultCode] = await digestAuthRequestAsync({
            method: "POST",
            url: request.body.url,
            username: request.body.login,
            password: request.body.password,
            data: request.body.data,
            contentType: "application/x-www-form-urlencoded",
            retryCount: 1,
            timeout: 5000,
        })

        if (resultCode !== 200) {
            return response.sendStatus(resultCode)
        }

        response.send(result)
    },
}